import { expect } from "chai";
import {
  AgentWithCookie,
  getAdminAgent,
  getGovAgent,
  getVendorAgent,
} from "helpers/user";

describe("API", () => {
  describe("Login", () => {
    describe("Admin", async () => {
      let adminAgent: AgentWithCookie;
      beforeEach(async () => {
        adminAgent = await getAdminAgent();
      });

      it("Logs in admin", async () => {
        await expect(adminAgent).to.exist;
      });
    });
    describe("Gov", async () => {
      let govAgent: AgentWithCookie;
      beforeEach(async () => {
        govAgent = await getGovAgent();
      });

      it("Logs in governement's user", async () => {
        await expect(govAgent).to.exist;
      });
    });
    describe("Vendor", async () => {
      let vendorAgent: AgentWithCookie;
      beforeEach(async () => {
        vendorAgent = await getVendorAgent("vendor01");
      });

      it("Logs in vendor", async () => {
        await expect(vendorAgent).to.exist;
      });
    });
  });
});
