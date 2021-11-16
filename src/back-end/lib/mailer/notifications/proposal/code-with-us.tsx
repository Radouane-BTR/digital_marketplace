import * as db from 'back-end/lib/db';
import { Emails } from 'back-end/lib/mailer';
import { makeCWUOpportunityInformation, viewCWUOpportunityCallToAction } from 'back-end/lib/mailer/notifications/opportunity/code-with-us';
import * as templates from 'back-end/lib/mailer/templates';
import { makeSend } from 'back-end/lib/mailer/transport';
import React from 'react';
import { CONTACT_EMAIL, EMPTY_STRING } from 'shared/config';
import { CWUOpportunity, isCWUOpportunityClosed } from 'shared/lib/resources/opportunity/code-with-us';
import { CWUProposal, CWUProposalSlim } from 'shared/lib/resources/proposal/code-with-us';
import { AuthenticatedSession } from 'shared/lib/resources/session';
import { User } from 'shared/lib/resources/user';
import { Id } from 'shared/lib/types';
import { getValidValue } from 'shared/lib/validation';
import i18next from 'i18next';

export async function handleCWUProposalSubmitted(connection: db.Connection, proposalId: Id, session: AuthenticatedSession): Promise<void> {
  // Notify the submitting user
  const proposal = getValidValue(await db.readOneCWUProposal(connection, proposalId, session), null);
  const opportunity = proposal && getValidValue(await db.readOneCWUOpportunity(connection, proposal.opportunity.id, session), null);
  if (proposal && opportunity) {
    await successfulCWUProposalSubmission(session.user, opportunity, proposal);
  }
}

export async function handleCWUProposalAwarded(connection: db.Connection, proposalId: Id, session: AuthenticatedSession): Promise<void> {
  // Notify the awarded proponent
  const proposal = getValidValue(await db.readOneCWUProposal(connection, proposalId, session), null);
  const opportunity = proposal && getValidValue(await db.readOneCWUOpportunity(connection, proposal.opportunity.id, session), null);
  const awardedUser = proposal && getValidValue(await db.readOneUser(connection, proposal.createdBy.id), null);
  if (proposal && opportunity && awardedUser) {
    await awardedCWUProposalSubmission(awardedUser, opportunity, proposal);

    // Notify the unsuccessful proponents
    const allOpportunityProposals = getValidValue(await db.readManyCWUProposals(connection, session, opportunity.id), null);
    if (allOpportunityProposals) {
      for (const proposal of allOpportunityProposals.filter(p => p.id !== proposalId)) {
        const unsuccessfulProponent = getValidValue(await db.readOneUser(connection, proposal.createdBy.id), null);
        if (unsuccessfulProponent) {
          await unsuccessfulCWUProposalSubmission(unsuccessfulProponent, opportunity, proposal);
        }
      }
    }
  }
}

export async function handleCWUProposalDisqualified(connection: db.Connection, proposalId: Id, session: AuthenticatedSession): Promise<void> {
  //Notify the disqualified proponent
  const proposal = getValidValue(await db.readOneCWUProposal(connection, proposalId, session), null);
  const opportunity = proposal && getValidValue(await db.readOneCWUOpportunity(connection, proposal.opportunity.id, session), null);
  const disqualifiedProponent = proposal && getValidValue(await db.readOneUser(connection, proposal.createdBy.id), null);
  if (proposal && opportunity && disqualifiedProponent) {
    await disqualifiedCWUProposalSubmission(disqualifiedProponent, opportunity, proposal);
  }
}

export async function handleCWUProposalWithdrawn(connection: db.Connection, proposalId: Id, session: AuthenticatedSession): Promise<void> {
  //Notify the opportunity author if the opportunity is in an awardable state
  const proposal = getValidValue(await db.readOneCWUProposal(connection, proposalId, session), null);
  const opportunity = proposal && getValidValue(await db.readOneCWUOpportunity(connection, proposal.opportunity.id, session), null);
  // Need to read opportunityAuthor separate here, as this session will not be allowed to read from opportunity itself
  const opportunityAuthor = proposal && getValidValue(await db.readOneCWUOpportunityAuthor(connection, proposal.opportunity.id), null);

  if (proposal && opportunity) {
    const withdrawnProponent = proposal.createdBy && getValidValue(await db.readOneUser(connection, proposal.createdBy.id), null);
    // Notify opportunity author if opportunity is closed
    if (opportunityAuthor && withdrawnProponent && isCWUOpportunityClosed(opportunity)) {
      await withdrawnCWUProposalSubmission(opportunityAuthor, withdrawnProponent, opportunity);
    }
    // Notify proposal author
    if (withdrawnProponent) {
      await withdrawnCWUProposalSubmissionProposalAuthor(withdrawnProponent, opportunity);
    }
  }
}

export const successfulCWUProposalSubmission = makeSend(successfulCWUProposalSubmissionT);

export async function successfulCWUProposalSubmissionT(recipient: User, opportunity: CWUOpportunity, proposal: CWUProposal): Promise<Emails> {
  const title =  i18next.t('mailerNotifications.successfulCWUProposalSubmissionTitle');
  const description = i18next.t('mailerNotifications.successfulCWUProposalSubmissionDescription');
  return [{
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity, recipient.locale)],
      body: (
        <div>
          <p style={{...templates.styles.utilities.font.italic}}>{i18next.t('whatHappensNext')}?</p>
          <p>{i18next.t('mailerNotifications.successfulCWUProposalSubmissionBodyP2-1')} <templates.Link text={i18next.t('links.sign-in')} url={templates.makeUrl('sign-in')} /> {i18next.t('mailerNotifications.successfulCWUProposalSubmissionBodyP2-2')}</p>
          <p>{i18next.t('mailerNotifications.successfulCWUProposalSubmissionBodyP3')}</p>
          <p>{i18next.t('goodLuck')}!</p>
        </div>
      ),
      callsToAction: [viewCWUOpportunityCallToAction(opportunity), viewCWUProposalCallToAction(proposal)]
    })
  }];
}

export const awardedCWUProposalSubmission = makeSend(awardedCWUProposalSubmissionT);

export async function awardedCWUProposalSubmissionT(recipient: User, opportunity: CWUOpportunity, proposal: CWUProposal | CWUProposalSlim): Promise<Emails> {
  const title = i18next.t('mailerNotifications.awardedCWUProposalSubmissionTitle');
  const description = i18next.t('mailerNotifications.awardedCWUProposalSubmissionDescription');
  return[{
    summary: i18next.t('mailerNotifications.awardedCWUProposalSubmissionSummary'),
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity, recipient.locale, false)],
      body: (
        <div>
          <p>{i18next.t('mailerNotifications.awardedCWUProposalSubmissionBodyP1-1')} <templates.Link text={i18next.t('links.sign-in')} url={templates.makeUrl('sign-in')} /> {i18next.t('mailerNotifications.awardedCWUProposalSubmissionBodyP1-2')}</p>
          <p style={{...templates.styles.utilities.font.italic}}>{i18next.t('whatHappensNext')}?</p>
          <p>{i18next.t('mailerNotifications.awardedCWUProposalSubmissionBodyP3')}</p>
        </div>
      ),
      callsToAction: [viewCWUOpportunityCallToAction(opportunity), viewCWUProposalCallToAction(proposal)]
    })
  }];
}

export const unsuccessfulCWUProposalSubmission = makeSend(unsuccessfulCWUProposalSubmissionT);

export async function unsuccessfulCWUProposalSubmissionT(recipient: User, opportunity: CWUOpportunity, proposal: CWUProposal | CWUProposalSlim): Promise<Emails> {
  const title = i18next.t('mailerNotifications.unsuccessfulCWUProposalSubmissionTitle');
  const description = i18next.t('mailerNotifications.unsuccessfulCWUProposalSubmissionDescription');
  return[{
    summary: i18next.t('mailerNotifications.unsuccessfulCWUProposalSubmissionSummary'),
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity, recipient.locale, false)],
      body: (
        <div>
          <p>{i18next.t('mailerNotifications.unsuccessfulCWUProposalSubmissionBodyP1')} {opportunity.successfulProponent?.name || EMPTY_STRING}.</p>
          <p>{i18next.t('mailerNotifications.awardedCWUProposalSubmissionBodyP1-1')} <templates.Link text={i18next.t('links.sign-in')} url={templates.makeUrl('sign-in')} /> {i18next.t('mailerNotifications.awardedCWUProposalSubmissionBodyP1-2')}</p>
          <p>{i18next.t('mailerNotifications.awardedCWUProposalSubmissionBodyP3')}</p>
        </div>
      ),
      callsToAction: [viewCWUOpportunityCallToAction(opportunity), viewCWUProposalCallToAction(proposal)]
    })
  }];
}

export const disqualifiedCWUProposalSubmission = makeSend(disqualifiedCWUProposalSubmissionT);

export async function disqualifiedCWUProposalSubmissionT(recipient: User, opportunity: CWUOpportunity, proposal: CWUProposal | CWUProposalSlim): Promise<Emails> {
  const title = i18next.t('mailerNotifications.disqualifiedCWUProposalSubmissionTitle');
  const description = i18next.t('mailerNotifications.disqualifiedCWUProposalSubmissionDescription');
  return[{
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity, recipient.locale)],
      body: (
        <div>
          <p>{i18next.t('notification.anyQuestion', {email: <templates.Link text={CONTACT_EMAIL} url={CONTACT_EMAIL} />})}</p>
        </div>
      ),
      callsToAction: [viewCWUOpportunityCallToAction(opportunity), viewCWUProposalCallToAction(proposal)]
    })
  }];
}

export const withdrawnCWUProposalSubmissionProposalAuthor = makeSend(withdrawnCWUProposalSubmissionProposalAuthorT);

export async function withdrawnCWUProposalSubmissionProposalAuthorT(recipient: User, opportunity: CWUOpportunity): Promise<Emails> {
  const title = i18next.t('mailerNotifications.withdrawnCWUProposalSubmissionProposalAuthorTitle');
  const description = i18next.t('mailerNotifications.withdrawnCWUProposalSubmissionProposalAuthorDescription');
  return[{
    summary: i18next.t('mailerNotifications.withdrawnCWUProposalSubmissionProposalAuthorSummary'),
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity, recipient.locale)],
      body: (
        <div>
          <p>{i18next.t('mailerNotifications.withdrawnCWUProposalSubmissionProposalAuthorBody')}</p>
        </div>
      ),
      callsToAction: [viewCWUOpportunityCallToAction(opportunity)]
    })
  }];
}

export const withdrawnCWUProposalSubmission = makeSend(withdrawnCWUProposalSubmissionT);

export async function withdrawnCWUProposalSubmissionT(recipient: User, withdrawnProponent: User, opportunity: CWUOpportunity): Promise<Emails> {
  const title = i18next.t('mailerNotifications.withdrawnCWUProposalSubmissionTitle');
  const description = i18next.t('mailerNotifications.withdrawnCWUProposalSubmissionDescription', {name: withdrawnProponent.name});
  return[{
    summary: i18next.t('mailerNotifications.withdrawnCWUProposalSubmissionSummary'),
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity, recipient.locale)],
      callsToAction: [viewCWUOpportunityCallToAction(opportunity)]
    })
  }];
}

export function viewCWUProposalCallToAction(proposal: CWUProposal | CWUProposalSlim) {
  return {
    text:  i18next.t('links.viewProposal'),
    url: templates.makeUrl(`/proposals/code-with-us/${proposal.id}`),
    style: templates.styles.classes.buttonInfo
  };
}
