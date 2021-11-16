import { Emails } from 'back-end/lib/mailer';
import * as templates from 'back-end/lib/mailer/templates';
import { makeSend } from 'back-end/lib/mailer/transport';
import React from 'react';
import { CONTACT_EMAIL } from 'shared/config';
import { Organization } from 'shared/lib/resources/organization';
import { User } from 'shared/lib/resources/user';
import i18next from 'i18next';
import { Trans } from 'react-i18next';

export const userAccountRegistered = makeSend(userAccountRegisteredT);

export async function userAccountRegisteredT(recipient: User): Promise<Emails> {
  const title = i18next.t('dashboard.welcome-title');
  const description = i18next.t('userAccountRegisteredDescription');
  return [{
    to: recipient.email || [],
    subject: title,
    html: templates.simple({
      title,
      description,
      callsToAction: [signInCallToAction()]
    })
  }];
}

export const inviteToRegister = makeSend(inviteToRegisterT);

export async function inviteToRegisterT(email: string, organization: Organization): Promise<Emails> {
  const title = i18next.t('inviteToRegisterTitle', { legalName: organization.legalName });
  return [{
    to: email,
    subject: title,
    html: templates.simple({
      title,
      body: (
        <div>
          <p>{i18next.t('inviteToRegisterBodyP1', { legalName: organization.legalName })}</p>
          <p>{i18next.t('inviteToRegisterBodyP2', { linkTo: <templates.Link text={i18next.t('links.sign-up')} url={templates.makeUrl('sign-up')} /> })}</p>
        </div>
      ),
      callsToAction: [signUpCallToAction()]
    })
  }];
}

export const accountDeactivatedSelf = makeSend(accountDeactivatedSelfT);

export async function accountDeactivatedSelfT(user: User): Promise<Emails> {
  const title = i18next.t('accountDeactivatedTitle');
  return [{
    summary: i18next.t('accountDeactivatedSummary'),
    to: user.email || [],
    subject: title,
    html: templates.simple({
      title,
      body: (
        <div>
          <Trans i18nKey="accountDeactivatedBody" components={{ paragraph: <p /> }} />
        </div>
      ),
      callsToAction: [signInCallToAction(i18next.t('signInToReactivateAccount'))]
    })
  }];
}

export const accountDeactivatedAdmin = makeSend(accountDeactivatedAdminT);

export async function accountDeactivatedAdminT(user: User): Promise<Emails> {
  const title = i18next.t('accountDeactivatedTitle');
  return [{
    summary: i18next.t('accountDeactivatedAdminSummary'),
    to: user.email || [],
    subject: title,
    html: templates.simple({
      title,
      body: (
        <div>
          <Trans 
            i18nKey="accountDeactivatedAdminBody"  
            values={{ linkTo: <templates.Link text={CONTACT_EMAIL} url={CONTACT_EMAIL} />}}
            components={{ paragraph: <p /> }} 
          />
        </div>
      )
    })
  }];
}

export const accountReactivatedSelf = makeSend(accountReactivatedSelfT);

export async function accountReactivatedSelfT(user: User): Promise<Emails> {
  const title = i18next.t('accountReactivatedTitle');
  const description = i18next.t('accountReactivatedDescription');
  return [{
    summary: i18next.t('accountReactivatedSummary'),
    to: user.email || [],
    subject: title,
    html: templates.simple({
      title,
      description,
      callsToAction: [signInCallToAction()]
    })
  }];
}

export const accountReactivatedAdmin = makeSend(accountReactivatedAdminT);

export async function accountReactivatedAdminT(user: User): Promise<Emails> {
  const title =  i18next.t('accountReactivatedTitle');
  return [{
    summary:  i18next.t('accountReactivatedAdminSummary'),
    to: user.email || [],
    subject: title,
    html: templates.simple({
      title,
      body: (
        <div>
          <Trans 
            i18nKey="accountReactivatedAdminBody"  
            values={{ linkTo: <templates.Link text={CONTACT_EMAIL} url={CONTACT_EMAIL} />}}
            components={{ paragraph: <p /> }} 
          />
        </div>
      ),
      callsToAction: [signInCallToAction()]
    })
  }];
}

export function signUpCallToAction() {
  return {
    text: i18next.t('links.sign-up'),
    url: templates.makeUrl('sign-up')
  };
}

export function signInCallToAction(text = i18next.t('links.sign-in')) {
  return {
    text,
    url: templates.makeUrl('sign-in')
  };
}
