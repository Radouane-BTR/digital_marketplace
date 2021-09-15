import { cwuOpportunityStatusToPastTenseVerb, cwuOpportunityStatusToPresentTenseVerb } from 'front-end/lib/pages/opportunity/code-with-us/lib';
import Link, { iconLinkSymbol, rightPlacement, routeDest } from 'front-end/lib/views/link';
import React from 'react';
import { CWUOpportunityStatus } from 'shared/lib/resources/opportunity/code-with-us';
import { adt, Id } from 'shared/lib/types';
import i18next from 'i18next';

export const statusChanged = {
  success: (s: CWUOpportunityStatus) => {
    const verb = cwuOpportunityStatusToPastTenseVerb(s);
    return {
      title: i18next.t('toasts.statusChanged.success-title', {what: verb}),
      body: i18next.t('toasts.statusChanged.success-title', {what: verb.toLowerCase()})
    };
  },
  error: (s: CWUOpportunityStatus) => {
    return {
      title: i18next.t('toasts.statusChanged.success-title', {what: cwuOpportunityStatusToPresentTenseVerb(s)}),
      body: i18next.t('toasts.statusChanged.success-title', {what: cwuOpportunityStatusToPastTenseVerb(s).toLowerCase()})
    };
  }
};

export const published = {
  success: (opportunityId: Id) => {
    const { title, body } = statusChanged.success(CWUOpportunityStatus.Published);
    return {
      title,
      body: (
        <div>
          {body}
          <div className='mt-2'>
            <Link newTab symbol_={rightPlacement(iconLinkSymbol('external-link'))} dest={routeDest(adt('opportunityCWUView', { opportunityId }))}>{i18next.t('links.viewOpportunity')}</Link>
          </div>
        </div>
      )
    };
  },
  error: statusChanged.error(CWUOpportunityStatus.Published)
};

export const draftCreated = {
  success: {
    title: i18next.t('toasts.draftCreated.success-title'),
    body: i18next.t('toasts.draftCreated.success-body'),
  },
  error: {
    title: i18next.t('toasts.draftCreated.error-title'),
    body: i18next.t('toasts.draftCreated.error-body'),
  }
};

export const deleted = {
  success: {
    title: i18next.t('toasts.deleted.success-title'),
    body: i18next.t('toasts.deleted.success-body')
  },
  error: {
    title: i18next.t('toasts.deleted.error-title'),
    body: i18next.t('toasts.deleted.error-body')
  }
};

export const changesSaved = {
  success: {
    title: i18next.t('toasts.changesSaved.success-title'),
    body: i18next.t('toasts.changesSaved.success-body')
  },
  error: {
    title: i18next.t('toasts.changesSaved.error-title'),
    body: i18next.t('toasts.changesSaved.error-body')
  }
};

export const changesPublished = {
  success: {
    title: i18next.t('toasts.changesPublished.success-title'),
    body: i18next.t('toasts.changesPublished.success-body')
  },
  error: {
    title:  i18next.t('toasts.changesPublished.error-title'),
    body:  i18next.t('toasts.changesPublished.error-body')
  }
};

export const startedEditing = {
  error: {
    title: i18next.t('toasts.startedEditing.error-title'),
    body: i18next.t('toasts.startedEditing.error-body'),
  }
};
