import { connectToDatabase } from "back-end/index";
import { findOneUserByTypeAndUsername } from "back-end/lib/db";
import { expect } from "chai";
import { randomUUID } from "crypto";
import { createCWUOpportunity, publishCWUOpportunity, validCwuOpportunity } from "helpers/opportunity";
import {
  AgentWithCookie,
  cleanupDatabase,
  getGovAgent,
  getVendorAgent,
} from "helpers/user";
import { UserType } from "shared/lib/resources/user";

describe("API", () => {
  describe("/api/opportunities/code-with-us", () => {
    describe("[POST] Create", () => {
      context("Gov", () => {
        let govAgent: AgentWithCookie;
        before(async () => {
          govAgent = await getGovAgent("usagop01");
        });
        it("saves valid opportunity", () => {
          return govAgent
            .post("/api/opportunities/code-with-us")
            .send(validCwuOpportunity)
            .expect(201);
        });
        it("saves an invalid opportunity if it is a draft", () => {
          return govAgent
            .post("/api/opportunities/code-with-us")
            .send({
              ...validCwuOpportunity,
              startDate: "1943-05-30",
              status: "DRAFT",
            })
            .expect(201);
        });
        it("prevents saving a faulty opportunity", () => {
          return govAgent
            .post("/api/opportunities/code-with-us")
            .send({ ...validCwuOpportunity, status: "INVALID" })
            .expect(400);
        });
        it("prevents saving an invalid opportunity if it is published", () => {
          return govAgent
            .post("/api/opportunities/code-with-us")
            .send({
              ...validCwuOpportunity,
              startDate: "1943-05-30",
              status: "PUBLISHED",
            })
            .expect(400);
        });
      });
      context("Vendor", () => {
        let vendorAgent: AgentWithCookie;
        before(async () => {
          vendorAgent = await getVendorAgent("vendor01");
        });
        it("cannot create opportunity", async () => {
          return vendorAgent
            .post("/api/opportunities/code-with-us")
            .send(validCwuOpportunity)
            .expect(401);
        });
      });
    });
    describe("[PUT] Edit", () => {
      context("Gov", () => {
        let govAgent: AgentWithCookie;
        let opportunityId: string; // The previously created opportunity
        let fileId: string; // The file ID that we will upload
        before(async () => {
          govAgent = await getGovAgent("usagop01");
          const opportunity = await createCWUOpportunity()
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
        context("When opportunity is a draft", () => {
          it("Opportunity can contain errors", async () => {
            await govAgent
              .put(`/api/opportunities/code-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: { startDate: "1986-05-01" /* Bad date */ },
              })
              .expect(200);
          });
          it("File can be added", async () => {
            const response = await govAgent
              .put(`/api/opportunities/code-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: { ...validCwuOpportunity, attachments: [fileId] },
              });
            expect(response.status).to.eql(200);
          });
          it("Can be published if valid", async () => {
            // Make opportunity valid
            await govAgent
              .put(`/api/opportunities/code-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: validCwuOpportunity,
              })
              .expect(200);
            const response = await govAgent
              .put(`/api/opportunities/code-with-us/${opportunityId}`)
              .send({
                tag: "publish",
                value: "Published",
              })
              .expect(200);
            const opportunity = response.body;
            expect(opportunity.status).to.eql("PUBLISHED");
          });
          it("Can't be published if invalid", async () => {
            // Create a new unpublished opportunity
            const opportunity = await createCWUOpportunity()
            opportunityId = opportunity.id;
            // Make opportunity invalid
            await govAgent
              .put(`/api/opportunities/code-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: { startDate: "1934-04-01" /* invalid date */ },
              })
              .expect(200);
            await govAgent
              .put(`/api/opportunities/code-with-us/${opportunityId}`)
              .send({
                tag: "publish",
                value: "Published",
              })
              .expect(400);
          });
        });
        context("When opportunity is published", () => {
          before(async () => {
            // Make opportunity valid
            const response = await govAgent
              .put(`/api/opportunities/code-with-us/${opportunityId}`)
              .send({
                tag: "edit",
                value: validCwuOpportunity,
              });
            expect(response.status).to.eql(200);
            await govAgent
              .put(`/api/opportunities/code-with-us/${opportunityId}`)
              .send({
                tag: "publish",
                value: "Published",
              })
              .expect(200);
          });
          it("Addendum can be added", async () => {
            const response = await govAgent
              .put(`/api/opportunities/code-with-us/${opportunityId}`)
              .send({
                tag: "addAddendum",
                value: "My First Addendum",
              });
            expect(response.status).to.eql(200);
            const opportunity = response.body;
            expect(opportunity.addenda).to.have.length(1);
          });
        });
      });
    });
    describe("[GET] Read", () => {
      let govAgent: AgentWithCookie;
      let vendorAgent: AgentWithCookie
      let publishedOpportunity:any;
      let draftOpportunity:any;
      before(async () => {
        await cleanupDatabase();
        govAgent = await getGovAgent("usagop01");
        vendorAgent = await getVendorAgent("vendor01");
        publishedOpportunity = await createCWUOpportunity()
        publishedOpportunity = await publishCWUOpportunity(publishedOpportunity)
        draftOpportunity = await createCWUOpportunity()
      });

      context("Gov", () => {
        it("returns opportunities", async () => {
          let response = await govAgent.get("/api/opportunities/code-with-us");
          expect(response.body).to.have.length(2);
          expect(response.body[0].id).to.eql(publishedOpportunity?.id)
          expect(response.body[1].id).to.eql(draftOpportunity?.id)
        });
      });

      context("As a vendor", () => {
        it("I can get all published opportunities", async () => {
          let response = await vendorAgent.get("/api/opportunities/code-with-us");
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
          const opportunity = await createCWUOpportunity()
          opportunityId = opportunity.id;
        });

        it("deleted opportunity", async () => {
          // Before destroy
          let response = await govAgent.get("/api/opportunities/code-with-us");
          expect(response.body).to.have.length(1);
          // Destroy
          await govAgent.delete(
            `/api/opportunities/code-with-us/${opportunityId}`
          );

          // Validate
          response = await govAgent.get("/api/opportunities/code-with-us");
          expect(response.body).to.have.length(0);
        });
      });
    });
  });
});
