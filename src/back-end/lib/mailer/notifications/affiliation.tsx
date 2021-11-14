import * as db from 'back-end/lib/db';
import { Emails } from 'back-end/lib/mailer';
import * as templates from 'back-end/lib/mailer/templates';
import { makeSend } from 'back-end/lib/mailer/transport';
import React from 'react';
import { Affiliation } from 'shared/lib/resources/affiliation';
import { Organization } from 'shared/lib/resources/organization';
import { User } from 'shared/lib/resources/user';
import { getValidValue } from 'shared/lib/validation';
import i18next from 'i18next';
import { Trans } from 'react-i18next';

export async function handleUserInvited(affiliation: Affiliation): Promise<void> {
  // Notify the user who was invited
  await addedToTeam(affiliation);
}

export async function handleUserAcceptedInvitation(connection: db.Connection, affiliation: Affiliation): Promise<void> {
  // Notify owner of the affiliated organization
  const owner = getValidValue(await db.readOneOrganizationOwner(connection, affiliation.organization.id), null);
  if (owner) {
    await approvedRequestToJoin(owner, affiliation);
  }

  // Notify the new member
  await membershipComplete(affiliation);
}

export async function handleUserRejectedInvitation(connection: db.Connection, affiliation: Affiliation): Promise<void> {
  // Notify owner of the affiliated organization
  const owner = getValidValue(await db.readOneOrganizationOwner(connection, affiliation.organization.id), null);
  if (owner) {
    await rejectRequestToJoin(owner, affiliation);
  }
}

export async function handleMemberLeavesTeam(connection: db.Connection, affiliation: Affiliation): Promise<void> {
  // Notify owner of the affiliated organization
  const owner = getValidValue(await db.readOneOrganizationOwner(connection, affiliation.organization.id), null);
  if (owner) {
    await memberLeaves(owner, affiliation);
  }
}

export const addedToTeam = makeSend(addedToTeamT);

export async function addedToTeamT(affiliation: Affiliation): Promise<Emails> {
  const organization = affiliation.organization;
  const recipient = affiliation.user;
  const title = i18next.t('mailerNotifications.addedToTeamTitle', {legalName: organization.legalName});
  return [{
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      body: ( 
        <div>
          <p>{i18next.t('mailerNotifications.addedToTeamBodyP1', {legalName: organization.legalName})}</p>
          <p style={{...templates.styles.utilities.font.italic}}>{i18next.t('whatHappensNext')}?</p>
          <Trans 
            i18nKey="mailerNotifications.addedToTeamBodyP2" 
            values={{ legalName: organization.legalName}}
            components={{ paragraph: <p /> }} 
          />
        </div>
      ),
      callsToAction: [approveJoinRequestCallToAction(recipient, affiliation), rejectJoinRequestCallToAction(recipient, affiliation)]
    })
  }];
}

export const approvedRequestToJoin = makeSend(approvedRequestToJoinT);

export async function approvedRequestToJoinT(recipient: User, affiliation: Affiliation): Promise<Emails> {
  const memberName = affiliation.user.name;
  const organizationName = affiliation.organization.legalName;
  const title = i18next.t('mailerNotifications.approvedRequestToJoinTitle', {memberName});
  return [{
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      body: (
        <div>
          <Trans 
            i18nKey="mailerNotifications.approvedRequestToJoinBody" 
            values={{ memberName, organizationName}}
            components={{ paragraph: <p /> }} 
          />
        </div>
      ),
      callsToAction: [viewOrganizationCallToAction(affiliation.organization)]
    })
  }];
}

export const rejectRequestToJoin = makeSend(rejectRequestToJoinT);

export async function rejectRequestToJoinT(recipient: User, affiliation: Affiliation): Promise<Emails> {
  const memberName = affiliation.user.name;
  const organizationName = affiliation.organization.legalName;
  const title =  i18next.t('mailerNotifications.rejectRequestToJoinTitle', {memberName: memberName});
  return [{
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      body: (
        <div>
          <p>{i18next.t('mailerNotifications.rejectRequestToJoinBody', {memberName: memberName, organizationName: organizationName})}</p>
        </div>
      )
    })
  }];
}

export const membershipComplete = makeSend(membershipCompleteT);

export async function membershipCompleteT(affiliation: Affiliation): Promise<Emails> {
  const recipient = affiliation.user;
  const organizationName = affiliation.organization.legalName;
  const title = i18next.t('mailerNotifications.membershipCompleteTitle', {organizationName: organizationName});
  return [{
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      body: (
        <div>
          <Trans 
            i18nKey="mailerNotifications.membershipCompleteBody" 
            values={{ organizationName: organizationName}}
            components={{ paragraph: <p /> }} 
          />
        </div>
      ),
      callsToAction: [viewMyOrganizationsCallToAction(recipient)]
    })
  }];
}

export const memberLeaves = makeSend(memberLeavesT);

export async function memberLeavesT(recipient: User, affiliation: Affiliation): Promise<Emails> {
  const organizationName = affiliation.organization.legalName;
  const memberName = affiliation.user.name;
  const title = i18next.t('mailerNotifications.memberLeavesTitle', {memberName: memberName, organizationName: organizationName});
  return [{
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      body: (
        <div>
          <p>{i18next.t('mailerNotifications.memberLeavesBody', {memberName: memberName, organizationName: organizationName})}</p>
        </div>
      ),
      callsToAction: [viewOrganizationCallToAction(affiliation.organization)]
    })
  }];
}

export function viewOrganizationCallToAction(organization: Organization): templates.LinkProps {
  return {
    text:  i18next.t('links.viewOrganization'),
    url: templates.makeUrl(`organizations/${organization.id}/edit`)
  };
}

export function viewMyOrganizationsCallToAction(user: User): templates.LinkProps {
  return {
    text: i18next.t('links.viewOrganizations'),
    url: templates.makeUrl(`users/${user.id}?tab=organizations`)
  };
}

export function approveJoinRequestCallToAction(user: User, affiliation: Affiliation) {
  return {
    text: i18next.t('links.approve'),
    url: templates.makeUrl(`users/${user.id}?tab=organizations&invitationAffiliationId=${affiliation.id}&invitationResponse=approve`),
    style: templates.styles.classes.buttonSuccess
  };
}

export function rejectJoinRequestCallToAction(user: User, affiliation: Affiliation) {
  return {
    text:  i18next.t('links.reject'),
    url: templates.makeUrl(`users/${user.id}?tab=organization&invitationAffiliationId=${affiliation.id}&invitationResponse=reject`),
    style: templates.styles.classes.buttonDanger
  };
}
