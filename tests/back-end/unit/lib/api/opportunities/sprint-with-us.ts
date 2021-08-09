import { connectToDatabase } from "back-end/index";
import { findOneUserByTypeAndUsername } from "back-end/lib/db";
import { expect } from "chai";
import { randomUUID } from "crypto";
import { createSWUDraft, createSWUOpportunity, invalidSwuOpportunity, publishSWUOpportunity, validSwuOpportunity } from "helpers/opportunity";
import {
  AgentWithCookie,
  cleanupDatabase,
  dbConnexion,
  getGovAgent,
  getVendorAgent,
} from "helpers/user";
import { SWUOpportunityStatus } from "shared/lib/resources/opportunity/sprint-with-us";
import { UserType } from "shared/lib/resources/user";

describe("API", () => {
  let govAgent: AgentWithCookie;
  let adminAgent: AgentWithCookie;
  before(async () => {
    govAgent = await getGovAgent("usagop01");
    adminAgent = await getGovAgent("admin01");
  });
  describe("/api/opportunities/sprint-with-us", () => {

    describe("[POST] Create", () => {
      beforeEach(async () => {
        await dbConnexion('swuOpportunities').delete()
      })
      context("Gov", () => {
        context("When opportunity is valid", () => {
          it("can save opportunity as draft", async () => {
            const response = await govAgent
              .post("/api/opportunities/sprint-with-us")
              .send(validSwuOpportunity)
            expect(response.statusCode).to.eql(201, JSON.stringify(response.body));
          });
          it('can save opportunity as "under review"', async () => {
            const response = await govAgent
              .post("/api/opportunities/sprint-with-us")
              .send({
                ...validSwuOpportunity,
                status: SWUOpportunityStatus.UnderReview
              })
            expect(response.statusCode).to.eql(201, JSON.stringify(response.body));
          });
          it('needs an admin to publish the opportunity', async () => {
            const response = await govAgent
              .post("/api/opportunities/sprint-with-us")
              .send({
                ...validSwuOpportunity,
                status: SWUOpportunityStatus.Published
              })
            expect(response.statusCode).to.eql(401, JSON.stringify(response.body));
          });
        })

        context("When opportunity is not valid", () => {
          it("saves opportunity with draft status", async () => {
            const response = await govAgent
              .post("/api/opportunities/sprint-with-us")
              .send({
                ...invalidSwuOpportunity,
                status: SWUOpportunityStatus.Draft,
              })
            expect(response.statusCode).to.eql(201, JSON.stringify(response.body));
          });

          it(`does not save opportunity with "Under review" status`, async () => {
            const response = await govAgent
              .post("/api/opportunities/sprint-with-us")
              .send({
                ...invalidSwuOpportunity,
                status: SWUOpportunityStatus.UnderReview
              })
            expect(response.statusCode).to.eql(400, JSON.stringify(response.body));
          })
        })

        it("prevents saving a faulty opportunity", async () => {
          const response = await govAgent
            .post("/api/opportunities/sprint-with-us")
            .send({ ...validSwuOpportunity, status: "NOT EXISTING STATUS" })
          expect(response.statusCode).to.eql(400, JSON.stringify(response.body));
        });
        it("can't publish opportunity (need an admin)", async () => {
          const response = await govAgent
            .post("/api/opportunities/sprint-with-us")
            .send({ ...validSwuOpportunity, status: SWUOpportunityStatus.Published })
          expect(response.statusCode).to.eql(401, JSON.stringify(response.body));
        });
      });
      context("Vendor", () => {
        let vendorAgent: AgentWithCookie;
        before(async () => {
          vendorAgent = await getVendorAgent("vendor01");
        });
        it("cannot create opportunity", async () => {
          return vendorAgent
            .post("/api/opportunities/sprint-with-us")
            .send(validSwuOpportunity)
            .expect(401);
        });
      });
    });
    describe("[PUT] Edit", async () => {
      let opportunityId: string; // The previously created opportunity
      let fileId: string; // The file ID that we will upload
      before(async () => {
        const opportunity = await createSWUDraft()
        opportunityId = opportunity.id;
        // Create the file first
        const dbConnexion = connectToDatabase();
        const govUser = await findOneUserByTypeAndUsername(
          dbConnexion,
          UserType.Government,
          "usagop01"
        );
        const fileResponse = await govAgent
          .post("/api/files")
          .attach("file", __filename, {
            filename: "MyFile.md",
            contentType: "application/text",
          })
          .field("name", randomUUID())
          .field(
            "metadata",
            JSON.stringify([{ tag: "user", value: govUser.value?.id }])
          )
          .expect(201);
        fileId = fileResponse.body.id;
      });

      context('Admin', () => {
        context("When opportunity is a draft", () => {
          // Bug, see https://github.com/bcgov/digital_marketplace/issues/163
          it.skip("prevents publishing an invalid opportunity", async () => {
            // Create draft
            const opportunity = await govAgent
              .post("/api/opportunities/sprint-with-us")
              .send(invalidSwuOpportunity)
              .expect(201)
            // Publish
            const response = await adminAgent
              .put(`/api/opportunities/sprint-with-us/${opportunity.body.id}`)
              .send({
                tag: "publish",
                value: "Published",
              })
            expect(response.statusCode).to.eql(400);
          });
          it("Can publish a valid opportunity", async () => {
            // Make opportunity valid
            await govAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: validSwuOpportunity,
              })
              .expect(200);
            await adminAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "publish",
                value: "Published",
              })
              .expect(200);
          });
        });
        context("When opportunity is published", () => {
          before(async () => {
            // create a new opportunity
            const opportunity = await createSWUDraft()
            opportunityId = opportunity.id
            // Make opportunity valid
            let response = await govAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: {...validSwuOpportunity, status: SWUOpportunityStatus.UnderReview},
              });
            expect(response.status).to.eql(200, JSON.stringify({edit: response.body}));
            // Publish it
            response = await adminAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "publish",
                value: "Published",
              })
            expect(response.status).to.eql(200, JSON.stringify({publish: response.body}));
          });
          it("Addendum can be added", async () => {
            const response = await adminAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "addAddendum",
                value: "My First Addendum",
              });
            expect(response.status).to.eql(200, JSON.stringify({addendum: response.body}));
          });
        });
      })
      context("Gov", () => {
        context("When opportunity is a draft", () => {
          before(async () => {
            // create a new opportunity
            const opportunity = await createSWUDraft()
            opportunityId = opportunity.id
          })
          it("Opportunity can contain errors", async () => {
            await govAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: { startDate: "1986-05-01" /* Bad date */ },
              })
              .expect(200);
          });
          it("File can be added", async () => {
            const response = await govAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: { ...validSwuOpportunity, attachments: [fileId] },
              });
            expect(response.status).to.eql(200);
          });
          it("Can't publish opportunity", async () => {
            // Make opportunity valid
            await govAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: validSwuOpportunity,
              })
              .expect(200);
            await govAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "publish",
                value: "Published",
              })
              .expect(401);
          });
          it("Can make opportunity reviewable", async () => {
            // Make opportunity valid
            await govAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: validSwuOpportunity,
              })
              .expect(200);
            const response = await govAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "submitForReview",
                value: "submitForReview",
              })
            expect(response.statusCode).to.eql(200);
          });
        });
        context("When opportunity is published", () => {
          before(async () => {
            // create a new opportunity
            const opportunity = await createSWUDraft()
            opportunityId = opportunity.id
            // Make opportunity valid
            const response = await govAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: validSwuOpportunity,
              });
            expect(response.status).to.eql(200);
            // Publish it
            await adminAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "publish",
                value: "Published",
              })
              .expect(200);
          });
          it("Addendum can't be added (Admin required)", async () => {
            const response = await govAgent
              .put(`/api/opportunities/sprint-with-us/${opportunityId}`)
              .send({
                tag: "addAddendum",
                value: "My First Addendum",
              });
            expect(response.status).to.eql(401);
          });
        });
      });
    });
    describe("[GET] Read", () => {
      let govAgent: AgentWithCookie;
      let vendorAgent: AgentWithCookie
      let publishedOpportunity: any;
      let draftOpportunity: any;
      before(async () => {
        await cleanupDatabase();
        govAgent = await getGovAgent("usagop01");
        vendorAgent = await getVendorAgent("vendor01");
        publishedOpportunity = await createSWUOpportunity()
        publishedOpportunity = await publishSWUOpportunity(publishedOpportunity)
        draftOpportunity = await createSWUOpportunity()
      });

      context("Gov", () => {
        it("returns opportunities", async () => {
          let response = await govAgent.get("/api/opportunities/sprint-with-us");
          expect(response.body).to.have.length(2);
          expect(response.body[0].id).to.eql(publishedOpportunity?.id)
          expect(response.body[1].id).to.eql(draftOpportunity?.id)
        });
      });

      context("As a vendor", () => {
        it("I can get all published opportunities", async () => {
          let response = await vendorAgent.get("/api/opportunities/sprint-with-us");
          expect(response.body).to.have.length(1);
          expect(response.body[0].id).to.eql(publishedOpportunity?.id)
        });
      });
    });
    describe("[DELETE] Delete", () => {
      let opportunityId: string;
      context("Gov", () => {
        let govAgent: AgentWithCookie;
        before(async () => {
          await cleanupDatabase();
          govAgent = await getGovAgent("usagop01");
          const opportunity = await createSWUOpportunity()
          opportunityId = opportunity.id;
        });

        it("deleted opportunity", async () => {
          // Before destroy
          let response = await govAgent.get("/api/opportunities/sprint-with-us");
          expect(response.body).to.have.length(1);
          // Destroy
          await govAgent.delete(
            `/api/opportunities/sprint-with-us/${opportunityId}`
          );

          // Validate
          response = await govAgent.get("/api/opportunities/sprint-with-us");
          expect(response.body).to.have.length(0);
        });
      });
    });
  });
});
