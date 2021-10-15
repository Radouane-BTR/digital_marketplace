import * as db from 'back-end/lib/db';
import { Emails } from 'back-end/lib/mailer';
import * as templates from 'back-end/lib/mailer/templates';
import { makeSend } from 'back-end/lib/mailer/transport';
import React from 'react';
import { CONTACT_EMAIL } from 'shared/config';
import { Organization } from 'shared/lib/resources/organization';
import { User } from 'shared/lib/resources/user';
import { getValidValue } from 'shared/lib/validation';
import { Trans } from 'react-i18next';
import i18next from 'i18next';

export async function handleOrganizationArchived(connection: db.Connection, organization: Organization): Promise<void> {
  const owner = organization.owner && getValidValue(await db.readOneUser(connection, organization.owner.id), null);
  if (owner) {
    await organizationArchived(owner, organization);
  }
}

export const organizationArchived = makeSend(organizationArchivedT);

export async function organizationArchivedT(recipient: User, organization: Organization): Promise<Emails> {
  const title = i18next.t('mailerNotifications.organizationArchivedTitle'); 
  return [{
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      body: (
        <div>
          <Trans 
            i18nKey="mailerNotifications.organizationArchivedBody" 
            values={{ linkTo: <templates.Link text={CONTACT_EMAIL} url={CONTACT_EMAIL} />, legalName: organization.legalName}}
            components={{ paragraph: <p /> }} 
          />
          {/* <p>Your Digital Marketplace organization, {organization.legalName}, has been archived by an administrator.</p>
          <p>You will no longer be able to use this organization in the web application. </p>
          <p>If you have any questions, you can send an email to the Digital Marketplace administrators at <templates.Link text={CONTACT_EMAIL} url={CONTACT_EMAIL} />.</p> */}
        </div>
      )
    })
  }];
}
