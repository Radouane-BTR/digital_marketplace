import {
  createCWUOpportunity,
  publishCWUOpportunity,
} from "helpers/opportunity";
import { AgentWithCookie, getVendorAgent } from "helpers/user";

describe("/api/subscribers/code-with-us", () => {
  let opportunity: any;
  before(async () => {
    opportunity = await createCWUOpportunity();
    opportunity = await publishCWUOpportunity(opportunity);
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
