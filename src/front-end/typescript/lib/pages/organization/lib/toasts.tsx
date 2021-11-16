import { TITLE as SWU_TERMS_TITLE } from 'front-end/lib/pages/organization/sprint-with-us-terms';
import React from 'react';
import { AffiliationMember, AffiliationSlim } from 'shared/lib/resources/affiliation';
import { Organization } from 'shared/lib/resources/organization';
import i18next from 'i18next';

export const created = {
  success: {
    title: i18next.t('toasts.created.success-title'),
    body: i18next.t('toasts.created.success-body')
  },
  error: {
    title: i18next.t('toasts.created.error-title'),
    body: i18next.t('toasts.created.error-body')
  }
};

export const updated = {
  success: {
    title: i18next.t('toasts.updated.success-title'),
    body:  i18next.t('toasts.updated.success-body')
  },
  error: {
    title:  i18next.t('toasts.updated.error-title'),
    body: i18next.t('toasts.updated.error-body')
  }
};

export const archived = {
  success: {
    title: i18next.t('toasts.archived.success-title'),
    body: i18next.t('toasts.archived.success-body'),
  },
  error: {
    title: i18next.t('toasts.archived.error-title'),
    body: i18next.t('toasts.archived.error-body')
  }
};

export const addedTeamMembers = {
  success: (emails: string[]) => ({
    title: i18next.t('toasts.addedTeamMembers.success-title'),
    body: (
      <div>
        <p>{i18next.t('toasts.addedTeamMembers.success-body')}</p>
        <ul>
          {emails.map((e, i) => (
            <li key={`organization-add-team-members-success-toast-${i}`}>{e}</li>
          ))}
        </ul>
      </div>
    )
  }),
  warning: (emails: string[]) => ({
    title: i18next.t('toasts.addedTeamMembers.warning-title'),
    body: (
      <div>
        <p>{i18next.t('toasts.addedTeamMembers.warning-body')}</p>
        <ul>
          {emails.map((e, i) => (
            <li key={`organization-add-team-members-warning-toast-${i}`}>{e}</li>
          ))}
        </ul>
      </div>
    )
  }),
  error: (emails: string[]) => ({
    title: i18next.t('toasts.addedTeamMembers.error-title'),
    body: (
      <div>
        <p>{i18next.t('toasts.addedTeamMembers.error-body')}</p>
        <ul>
          {emails.map((e, i) => (
            <li key={`organization-add-team-members-error-toast-${i}`}>{e}</li>
          ))}
        </ul>
      </div>
    )
  })
};

export const removedTeamMember = {
  success: (aff: AffiliationMember) => ({
    title: i18next.t('toasts.removedTeamMember.success-title'),
    body: i18next.t('toasts.removedTeamMember.success-body', {name : aff.user.name})
  }),
  error: (aff: AffiliationMember) => ({
    title: i18next.t('toasts.removedTeamMember.error-title'),
    body: i18next.t('toasts.removedTeamMember.error-body', {name : aff.user.name})
  })
};

export const acceptedSWUTerms = {
  success: (organization: Organization) => ({
    title: i18next.t('toasts.acceptedSWUTerms.success-title'),
    body: i18next.t('toasts.acceptedSWUTerms.success-body', {termsTitle: SWU_TERMS_TITLE, legalName :  organization.legalName})
  }),
  error: (organization: Organization) => ({
    title: i18next.t('toasts.acceptedSWUTerms.error-title'),
    body: i18next.t('toasts.acceptedSWUTerms.error-body', {termsTitle : SWU_TERMS_TITLE, legalName :  organization.legalName})
  })
};

export const leftOrganization = {
  success: (aff: AffiliationSlim) => ({
    title: i18next.t('toasts.leftOrganization.success-title'),
    body: i18next.t('toasts.leftOrganization.success-body', {legalName :  aff.organization.legalName})
  }),
  error: (aff: AffiliationSlim) => ({
    title: i18next.t('toasts.leftOrganization.error-title'),
    body: i18next.t('toasts.leftOrganization.error-body', {legalName :  aff.organization.legalName})
  })
};

export const approvedOrganizationRequest = {
  success: (aff: AffiliationSlim) => ({
    title: i18next.t('toasts.approvedOrganizationRequest.success-title'),
    body: i18next.t('toasts.approvedOrganizationRequest.success-body', {legalName : aff.organization.legalName})
  }),
  error: (aff: AffiliationSlim) => ({
    title: i18next.t('toasts.approvedOrganizationRequest.error-title'),
    body: i18next.t('toasts.approvedOrganizationRequest.error-body', {legalName : aff.organization.legalName})
  })
};

export const rejectedOrganizationRequest = {
  success: (aff: AffiliationSlim) => ({
    title: i18next.t('toasts.rejectedOrganizationRequest.success-title'),
    body: i18next.t('toasts.rejectedOrganizationRequest.success-body', {legalName : aff.organization.legalName})
  }),
  error: (aff: AffiliationSlim) => ({
    title: i18next.t('toasts.rejectedOrganizationRequest.error-title'),
    body: i18next.t('toasts.rejectedOrganizationRequest.error-body', {legalName : aff.organization.legalName})
  })
};
