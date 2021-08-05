import { connectToDatabase } from "back-end/index";
import { findOneUserByTypeAndUsername } from "back-end/lib/db";
import {
  AgentWithCookie,
  cleanupDatabase,
  getVendorAgent,
} from "helpers/user";
import { UserType } from "shared/lib/resources/user";

describe("API", () => {
  describe("/api/users", () => {
    describe("[PUT] Update", () => {
      let vendorId: string;
      context("As a vendor", () => {
        let vendorAgent: AgentWithCookie;
        before(async () => {
          await cleanupDatabase();
          vendorAgent = await getVendorAgent("vendor01");
          const dbConnexion = connectToDatabase();
          const vendor = await findOneUserByTypeAndUsername(
            dbConnexion,
            UserType.Vendor,
            "vendor01"
          );
          vendorId = vendor.value?.id as string;
        });

        it("I can accept terms", async () => {
          vendorAgent.put(`/api/users/${vendorId}`)
          .send({ tag: 'acceptTerms'})
            .expect(200)
        });

        it("I can't accept terms for someone else", async () => {
          const vendor2Agent = await getVendorAgent("vendor02");
          vendor2Agent.put(`/api/users/${vendorId}`)
          .send({ tag: 'acceptTerms'})
          .expect(401)
        });
      });
    });
  });
});
