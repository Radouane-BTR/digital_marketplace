import {
  createOpportunity,
  publishOpportunity,
  validCwuOpportunity,
} from "helpers/opportunity";
import { AgentWithCookie, getGovAgent, getVendorAgent } from "helpers/user";

describe("/api/subscribers/code-with-us", () => {
  let govAgent: AgentWithCookie;
  let opportunity: any;
  before(async () => {
    govAgent = await getGovAgent("usagop01");
    opportunity = await createOpportunity(govAgent, validCwuOpportunity);
    opportunity = await publishOpportunity(govAgent, opportunity);
  });

  context("As a vendor", () => {
    let vendorAgent: AgentWithCookie;
    before(async () => {
      vendorAgent = await getVendorAgent("vendor01");
    });
    describe("[POST] Subscribe", () => {
      it("can subscribe to an opportunity", async () => {
        await vendorAgent
          .post(`/api/subscribers/code-with-us`)
          .send({ opportunity: opportunity.id })
          .expect(201);
      });
    });
  });
});
