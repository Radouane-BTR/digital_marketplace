import * as opportunityToasts from 'front-end/lib/pages/opportunity/code-with-us/lib/toasts';
import { cwuProposalStatusToPastTenseVerb, cwuProposalStatusToPresentTenseVerb } from 'front-end/lib/pages/proposal/code-with-us/lib';
import { CWUOpportunityStatus } from 'shared/lib/resources/opportunity/code-with-us';
import { CWUProposalStatus } from 'shared/lib/resources/proposal/code-with-us';
import i18next from 'i18next';

export const awarded = {
  success: opportunityToasts.statusChanged.success(CWUOpportunityStatus.Awarded),
  error: opportunityToasts.statusChanged.error(CWUOpportunityStatus.Awarded)
};

export const submitted = {
  success: {
    title: i18next.t('toasts.proposalSubmitted.success-title'),
    body: i18next.t('toasts.proposalSubmitted.success-body')
  },
  error: {
    title: i18next.t('toasts.proposalSubmitted.error-title'),
    body: i18next.t('toasts.proposalSubmitted.error-body')
  }
};

export const statusChanged = {
  success: (s: CWUProposalStatus) => {
    const verb = cwuProposalStatusToPastTenseVerb(s);
    return {
      title: i18next.t('toasts.propsalStatusChanged.success-title', {verb: verb}),
      body: i18next.t('toasts.propsalStatusChanged.success-body', {verb: verb.toLocaleLowerCase()})
    };
  },
  error: (s: CWUProposalStatus) => {
    return {
      title: i18next.t('toasts.propsalStatusChanged.error-title', {verb: cwuProposalStatusToPresentTenseVerb(s)}),
      body: i18next.t('toasts.propsalStatusChanged.error-body', {verb: cwuProposalStatusToPresentTenseVerb(s).toLowerCase()})
    };
  }
};

export const draftCreated = {
  success: {
    title: i18next.t('toasts.propsalDraftCreated.success-title'),
    body: i18next.t('toasts.propsalDraftCreated.success-body')
  },
  error: {
    title:  i18next.t('toasts.propsalDraftCreated.error-title'),
    body:  i18next.t('toasts.propsalDraftCreated.error-body')
  }
};

export const deleted = {
  success: {
    title: i18next.t('toasts.propsalDeleted.success-title'),
    body: i18next.t('toasts.propsalDeleted.success-body')
  },
  error: {
    title: i18next.t('toasts.propsalDeleted.error-title'),
    body: i18next.t('toasts.propsalDeleted.error-body')
  }
};

export const changesSaved = {
  success: {
    title: i18next.t('toasts.propsalChangesSaved.success-title'),
    body: i18next.t('toasts.propsalChangesSaved.success-body')
  },
  error: {
    title: i18next.t('toasts.propsalChangesSaved.error-title'),
    body: i18next.t('toasts.propsalChangesSaved.error-body')
  }
};

export const changesSubmitted = {
  success: {
    title: i18next.t('toasts.propsalChangesSubmitted.success-title'),
    body: i18next.t('toasts.propsalChangesSubmitted.success-body')
  },
  error: {
    title: i18next.t('toasts.propsalChangesSubmitted.error-title'),
    body: i18next.t('toasts.propsalChangesSubmitted.error-body')
  }
};
