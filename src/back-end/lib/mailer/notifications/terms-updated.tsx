import * as db from 'back-end/lib/db';
import * as templates from 'back-end/lib/mailer/templates';
import { makeSend } from 'back-end/lib/mailer/transport';
import React from 'react';
import { User, UserType } from 'shared/lib/resources/user';
import { getValidValue } from 'shared/lib/validation';
import i18next from 'i18next';

export async function handleTermsUpdated(connection: db.Connection): Promise<void> {
  const activeVendors = getValidValue(await db.readManyUsersByRole(connection, UserType.Vendor, false), null);
  if (activeVendors) {
    for (const vendor of activeVendors) {
      await vendorTermsChanged(vendor);
    }
  }
}

export const vendorTermsChanged = makeSend(vendorTermsChangedT);

export async function vendorTermsChangedT(recipient: User) {
  const title = i18next.t('mailerNotifications.vendorTermsChangedTitle');
  const description = i18next.t('mailerNotifications.vendorTermsChangedDescription');
  return [{
    summary: i18next.t('mailerNotifications.vendorTermsChangedSummary'),
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      description,
      body: (
        <div>
          <p>{i18next.t('mailerNotifications.vendorTermsChangedBody')}</p>
        </div>
      ),
      callsToAction: [viewTermsAndConditionsCallToAction(recipient)]
    })
  }];
}

export function viewTermsAndConditionsCallToAction(vendor: User): templates.LinkProps {
  return {
    text: i18next.t('mailerNotifications.viewTermsAndConditionsCallToActionText'),
    url: templates.makeUrl(`/users/${vendor.id}?tab=legal`)
  };
}
