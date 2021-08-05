import { databaseConnection } from 'back-end/index';
import { generateUuid } from 'back-end/lib';
import {
  createContent,
  createCWUOpportunity,
  CreateCWUOpportunityParams,
  findOneUserByTypeAndUsername,
  RawUser,
  readOneContentById,
} from 'back-end/lib/db';
import { createOrganization } from 'back-end/lib/db/organization';
import { cwuOpportunity, organization } from 'back-end/lib/routers/admin/mocks';
import { expect } from 'chai';
import {
  AgentWithCookie,
  cleanupDatabase,
  getAdminAgent,
  getGovAgent,
  getVendorAgent,
} from 'helpers/user';
import { CWUOpportunity } from 'shared/lib/resources/opportunity/code-with-us';
import { Organization } from 'shared/lib/resources/organization';
import { SessionRecord } from 'shared/lib/resources/session';
import { User, UserStatus, UserType } from 'shared/lib/resources/user';
describe('API', () => {
  describe('Admin', () => {
    let adminAgent: AgentWithCookie;
    before(async () => {
      await cleanupDatabase();
      adminAgent = await getAdminAgent();
    });
    describe('/api/users', async () => {
      context('[GET] User list', () => {
        let users: Array<User>;
        before(async () => {
          // Create missing users
          await getVendorAgent('vendor01');
          await getVendorAgent('vendor02');
          await getGovAgent('usagop01');
          users = (await adminAgent.get('/api/users').expect(200))
            .body as Array<User>;
        });

        it('contains all governments users', async () => {
          expect(
            users.filter((user) => (user as User).type === UserType.Government)
          ).to.have.length(1);
        });

        it('contains all admin users', async () => {
          expect(
            users.filter((user) => (user as User).type === UserType.Admin)
          ).to.have.length(1);
        });

        it('contains all vendor users', async () => {
          expect(
            users.filter((user) => (user as User).type === UserType.Vendor)
          ).to.have.length(2);
        });
      });

      context('[DELETE] Deactivate user account', () => {
        let user: User;

        before(async () => {
          // Create user to deactivate
          await getVendorAgent('vendor01');
          user = (
            await findOneUserByTypeAndUsername(
              databaseConnection,
              UserType.Vendor,
              'vendor01'
            )
          ).value as User;

          // Query
          const response = await adminAgent.delete(`/api/users/${user.id}`);
          expect(response.statusCode).to.eql(200);

          // Reload the user
          user = (
            await findOneUserByTypeAndUsername(
              databaseConnection,
              UserType.Vendor,
              'vendor01'
            )
          ).value as User;
        });

        it('logs those who deactivates the user', async () => {
          const admin = (
            await findOneUserByTypeAndUsername(
              databaseConnection,
              UserType.Admin,
              'admin01'
            )
          ).value as User;
          expect(user.deactivatedBy).to.eql(admin.id);
        });

        it('deactivates user', async () => {
          expect(user.status).to.eql(UserStatus.InactiveByAdmin);
        });
      });

      context('[PUT] Reactivate user account', () => {
        let user: User;
        const vendorUsername = 'vendor02';

        before(async () => {
          await cleanupDatabase();
          adminAgent = await getAdminAgent();

          // Create user to (de/re)activate
          await getVendorAgent(vendorUsername);
          user = (
            await findOneUserByTypeAndUsername(
              databaseConnection,
              UserType.Vendor,
              vendorUsername
            )
          ).value as User;
          // Deactivate
          user = (await adminAgent.delete(`/api/users/${user.id}`).expect(200))
            .body as User;
          user = (
            await adminAgent
              .put(`/api/users/${user.id}`)
              .send({
                tag: 'reactivateUser',
              })
              .expect(200)
          ).body as User;
        });
        it('reactivates user', async () => {
          expect(user.status).to.eql(UserStatus.Active);
        });
      });
    });
    describe('/api/organizations', async () => {
      let orgs: { items: Array<Organization> };
      let org1: Organization;
      let org2: Organization;
      before(async () => {
        // Create organization owners
        await getVendorAgent('vendor01');
        await getVendorAgent('vendor02');
        const orgOwner = (
          await findOneUserByTypeAndUsername(
            databaseConnection,
            UserType.Vendor,
            'vendor01'
          )
        ).value as User;
        const orgOwner2 = (
          await findOneUserByTypeAndUsername(
            databaseConnection,
            UserType.Vendor,
            'vendor02'
          )
        ).value as User;

        // Create some organizations
        org1 = (
          await createOrganization(
            databaseConnection,
            orgOwner.id,
            {
              ...organization,
              legalName: 'AAA corp',
              logoImageFile: undefined,
            },
            orgOwner
          )
        ).value as Organization;
        org2 = (
          await createOrganization(
            databaseConnection,
            orgOwner2.id,
            {
              ...organization,
              legalName: 'BBB corp',
              logoImageFile: undefined,
            },
            orgOwner2
          )
        ).value as Organization;
        await getVendorAgent('vendor02');
        await getGovAgent('usagop01');

        // Query
        const response = await adminAgent.get(
          '/api/organizations?page=1&pageSize=1000'
        );
        orgs = response.body as { items: Array<Organization> };
        expect(response.statusCode).to.eql(200);
      });

      it('contains all organizations', async () => {
        expect(orgs.items).to.have.length(2);

        const orgIds = orgs.items.map(({ id }) => id);
        expect(orgIds).to.include(org1.id);
        expect(orgIds).to.include(org2.id);
      });

      context('when paginated', () => {
        it('show the first page result', async () => {
          const response = await adminAgent.get(
            '/api/organizations?page=1&pageSize=1'
          );
          orgs = response.body as { items: Array<Organization> };
          expect(response.statusCode).to.eql(200);
          expect(orgs.items).to.have.length(1);
          expect(orgs.items[0].id).to.eql(org1.id);
        });
        it('show the second page result', async () => {
          const response = await adminAgent.get(
            '/api/organizations?page=2&pageSize=1'
          );
          orgs = response.body as { items: Array<Organization> };
          expect(response.statusCode).to.eql(200);
          expect(orgs.items).to.have.length(1);
          expect(orgs.items[0].id).to.eql(org2.id);
        });
      });
    });
    describe('/api/opportunities/code-with-us', async () => {
      let opportunities: Array<CWUOpportunity>;
      let opportunity1: CWUOpportunity;
      let opportunity2: CWUOpportunity;
      const { addenda, successfulProponent, updatedAt, ...cwuOpportunityData } =
        cwuOpportunity;
      let opportunityMock = cwuOpportunityData;

      before(async () => {
        // Create government user
        await getGovAgent('usagop01');
        const opUser = (
          await findOneUserByTypeAndUsername(
            databaseConnection,
            UserType.Government,
            'usagop01'
          )
        ).value as User;

        // Create some opportunities
        opportunity1 = (
          await createCWUOpportunity(
            databaseConnection,
            opportunityMock as CreateCWUOpportunityParams,
            { user: opUser } as SessionRecord
          )
        ).value as CWUOpportunity;
        opportunity2 = (
          await createCWUOpportunity(
            databaseConnection,
            opportunityMock as CreateCWUOpportunityParams,
            { user: opUser } as SessionRecord
          )
        ).value as CWUOpportunity;
        // Query
        const response = await adminAgent.get(
          '/api/opportunities/code-with-us'
        );
        opportunities = response.body as Array<CWUOpportunity>;
        expect(response.statusCode).to.eql(200);
      });

      it('contains all organizations', async () => {
        expect(opportunities).to.have.length(2);

        const opportunityIds = opportunities.map(({ id }) => id);
        expect(opportunityIds).to.include(opportunity1.id);
        expect(opportunityIds).to.include(opportunity2.id);
      });
    });

    describe('/api/organizations/', () => {
      describe('[DELETE] archive organization', async () => {
        it("sets organization's status as ARCHIVED");
      });
    });

    describe('/api/content/', () => {
      let contentId: string;
      let admin: User;
      interface Content {
        id?: string;
        body: string;
        title: string;
        slug: string;
        fixed: boolean;
      }
      const contentData: Content = {
        slug: 'my-slug',
        title: 'The title',
        body: 'Lorem ipsum',
        fixed: false,
      };
      before(async () => {
        cleanupDatabase();
        adminAgent = await getAdminAgent();
        admin = (
          await findOneUserByTypeAndUsername(
            databaseConnection,
            UserType.Admin,
            'admin01'
          )
        ).value as User;
      });

      describe('[PUT] creates new content', async () => {
        before(async () => {
          const response = await adminAgent
            .post('/api/content')
            .send(contentData)
            .expect(201);
          contentId = response.body.id;
        });
        it('inserts content into the database', async () => {
          const { value: content } = await readOneContentById(
            databaseConnection,
            contentId,
            { user: admin } as SessionRecord
          );
          expect(content).to.exist;
          expect(content?.id).to.eql(contentId);
        });
      });
      describe('[POST] updates content', async () => {
        interface Content {
          body: string;
          title: string;
          slug: string;
        }
        const newContentBody = 'New body';
        const newContentTitle = 'New title';
        let updatedContent: Content;
        before(async () => {
          // Create the content to update
          const { value: newContent } = await createContent(
            databaseConnection,
            { ...contentData, slug: generateUuid() },
            { user: admin } as SessionRecord
          );
          contentId = newContent?.id as string;
          expect(contentId).to.exist;
          const response = await adminAgent
            .put(`/api/content/${contentId}`)
            .send({
              ...newContent,
              body: newContentBody,
              title: newContentTitle,
            });
          expect(response.statusCode).to.eql(200);
          const { value: content } = await readOneContentById(
            databaseConnection,
            contentId,
            { user: admin } as SessionRecord
          );
          updatedContent = content as Content;
          expect(updatedContent).to.exist;
        });
        it('updates the body', async () => {
          expect(updatedContent?.body).to.eql(newContentBody);
        });
        it('updates the title', async () => {
          expect(updatedContent?.title).to.eql(newContentTitle);
        });
      });
      describe('[GET] get content', async () => {
        const contents: Array<Content> = [];
        before(async () => {
          // Remove previous contents
          await databaseConnection('content').delete();
          // Create new contents
          await Promise.all(
            Array(2).fill(null).map(async () => {
              const { value } = await createContent(
                databaseConnection,
                { ...contentData, slug: generateUuid() },
                { user: admin } as SessionRecord
              );
              contents.push(value as Content);
            })
          );
        });
        it('get all contents', async () => {
          const response = await adminAgent.get(`/api/content`).expect(200);
          const foundContents: Array<Content> = response.body;
          expect(foundContents).to.have.length(contents.length);
          const contentIds = foundContents.map(({ id }) => id);
          expect(contentIds).to.include(contents[0].id);
          expect(contentIds).to.include(contents[1].id);
        });
        it('get one content by slug', async () => {
          const response = await adminAgent
            .get(`/api/content/${contents[0].slug}`)
            .expect(200);
          expect(response.body.title).to.eql(contents[0].title);
        });
        it('get one content by id', async () => {
          const response = await adminAgent
            .get(`/api/content/${contents[0].id}`)
            .expect(200);
          expect(response.body.title).to.eql(contents[0].title);
        });
      });
      describe('[DELETE] delete content', async () => {
        let contents: Array<Content> = [];
        before(async () => {
          // Remove previous contents
          await databaseConnection('content').delete();
          // Create new contents
          await Promise.all(
            Array(2).fill(null).map(async () => {
              const { value } = await createContent(
                databaseConnection,
                { ...contentData, slug: generateUuid() },
                { user: admin } as SessionRecord
              );
              contents.push(value as Content);
            })
          );
          await adminAgent.delete(`/api/content/${contents[0].id}`).expect(200);
        });
        it('deletes the content', async () => {
          await adminAgent.get(`/api/content/${contents[0].slug}`).expect(404);
        });
        it('dows not delete other contents', async () => {
          await adminAgent.get(`/api/content/${contents[1].slug}`).expect(200);
        });
      });
    });

    describe('/api/email-notifications', () => {
      context('[POST]', () => {
        describe('tag: updateTerms', () => {
          before(async () => {
            adminAgent = await getAdminAgent();
            // Create users
            await Promise.all(
              ['vendor01', 'vendor02', 'vendor03'].map((vendor) =>
                getVendorAgent(vendor)
              )
            );
            // Make them accepting terms
            await databaseConnection<RawUser>('users')
              .where({ type: UserType.Vendor })
              .update(
                {
                  acceptedTermsAt: new Date(),
                },
                '*'
              );

            // The query to test
            await adminAgent
              .post('/api/emailNotifications')
              .send({ tag: 'updateTerms' })
              .expect(200);
          });

          it('removes vendor acceptation', async () => {
            const results = await databaseConnection<RawUser>('users')
              .where({ type: UserType.Vendor })
              .andWhereNot({ acceptedTermsAt: null });
            expect(results).to.have.length(0);
          });

          it('is an admin feature', async () => {
            const vendorAgent = await getVendorAgent('vendor04');
            await vendorAgent
              .post('/api/emailNotifications')
              .send({ tag: 'updateTerms' })
              .expect(401);

            const govAgent = await getGovAgent('usagop01');
            await govAgent
              .post('/api/emailNotifications')
              .send({ tag: 'updateTerms' })
              .expect(401);
          });
        });
      });
    });
  });
});
