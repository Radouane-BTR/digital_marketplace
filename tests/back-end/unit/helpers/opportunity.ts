import { connectToDatabase } from "back-end/index";
import { closeCWUOpportunities } from "back-end/lib/db";
import { AgentWithCookie } from "./user";

/**
 * Create an opportunity draft
 * 
 * @param agent The agent session of the government user
 * @param opportunity The opportunity
 * @returns 
 */
export const createOpportunity = async (
  agent: AgentWithCookie,
  opportunity: object
): Promise<any> => {
  const response = await agent
    .post("/api/opportunities/code-with-us")
    .send(opportunity);
  if (response.statusCode !== 201) {
    throw new Error(JSON.stringify(response, null, 2));
  }
  return response.body;
};

/**
 * Publish an opportunity
 * 
 * @param agent The agent session of the government user
 * @param opportunity The opportunity
 * @returns 
 */
export const publishOpportunity = async (
  agent: AgentWithCookie,
  opportunity: any
): Promise<any> => {
  const response = await agent
    .put(`/api/opportunities/code-with-us/${opportunity.id}`)
    .send({
      tag: "publish",
      value: "Published",
    });
  if (response.statusCode !== 200) {
    throw new Error(JSON.stringify(response, null, 2));
  }
  return response.body;
};

const futureDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7); // now + 1 week


/**
 * A valid code-with-us opportunity.
 */
export const validCwuOpportunity = {
  title: "Test CWU Opportunity",
  teaser: "Sample Teaser",
  remoteOk: false,
  location: "Victoria",
  reward: 70000,
  skills: ["foo", "bar"],
  description: "Sample Description Lorem Ipsum",
  proposalDeadline: futureDate,
  assignmentDate: futureDate,
  startDate: futureDate,
  completionDate: futureDate,
  submissionInfo: "github.com",
  acceptanceCriteria: "Sample Acceptance Criteria",
  evaluationCriteria: "Sample Evaluation Criteria",
  status: "DRAFT",
  attachments: [],
};

/**
 * A valid code-with-us proposal.
 * Please replace Opportunity ID
 */
export const validCwuProposal = {
  opportunity: "{{cwu_opp_id}}",
  proposalText: "You should hire me",
  additionalComments: "please",
  proponent: {
    tag: "individual",
    value: {
      legalName: "Andrew S",
      email: "foo@bar.com",
      phone: "222-222-2222",
      street1: "foo",
      city: "Saskatoon",
      region: "SK",
      mailCode: "V8Z1T8",
      country: "Canada",
    },
  },
  attachments: [],
  status: "DRAFT",
};

/**
 * Create and submit a proposal draft for the given opportunity
 * 
 * @param agent The session agent
 * @param opportunity The opportunity
 * @param proposal The proposal. If empty, create a valid default proposal
 * @returns The proposal
 */
export async function submitProposal(
  agent: AgentWithCookie,
  opportunity: any,
  proposal: any | undefined = validCwuProposal
) {
  const vendorProposal = await createProposalDraft(
    agent,
    opportunity,
    proposal
  );
  // Submit it
  const response = await agent
    .put(`/api/proposals/code-with-us/${vendorProposal.id}`)
    .send({
      tag: "submit",
      value: "NoOp",
    });
  if (response.statusCode !== 200) {
    throw new Error(JSON.stringify(response.body, null, 2));
  }
  return response.body;
}

/**
 * Create a proposal draft for the given opportunity
 * 
 * @param agent The session agent
 * @param opportunity The opportunity
 * @param proposal The proposal. If empty, create a valid default proposal
 * @returns The proposal
 */
export async function createProposalDraft(
  agent: AgentWithCookie,
  opportunity: any,
  proposal: any | undefined = validCwuProposal
) {
  let response = await agent.post(`/api/proposals/code-with-us`).send({
    ...proposal,
    opportunity: opportunity.id,
  });
  if (response.statusCode !== 201) {
    throw new Error(JSON.stringify(response.body, null, 2));
  }
  return response.body;
}

/**
 * Make opportunity evaluatable by changing its status
 * 
 * @param opportunity The opportunity to update
 * @returns Opportunity's new status
 */
export async function makeOpportunityEvaluatable(opportunity: any) {
  const dbConnection = connectToDatabase();
  const status = await dbConnection("cwuOpportunityVersions")
    .where({ opportunity: opportunity.id })
    .update({ proposalDeadline: new Date(new Date().getTime() - 1000 * 60) })
    .returning("*");
  await closeCWUOpportunities(dbConnection)
  return status;
}