import { ContentLink } from 'front-end/lib/pages/content/lib';
import React from 'react';
import { COPY } from 'shared/config';
import { Content } from 'shared/lib/resources/content';
import i18next from 'i18next';
import { Trans } from 'react-i18next';

type MiniContent = Pick<Content, 'title' | 'slug'>;

export const published = {
  success: (content: MiniContent) => ({
    title: i18next.t('content-toasts.published.success-title'),
    body: (<span><ContentLink {...content} newTab /> {i18next.t('content-toasts.published.success-body')}</span>)
  }),
  error: {
    title: i18next.t('content-toasts.published.error-title'),
    body: i18next.t('content-toasts.published.error-body'),
  }
};

export const deleted = {
  success: (title: string) => ({
    title: i18next.t('content-toasts.deleted.success-title'),
    body: (<span><em>{title}</em> {i18next.t('content-toasts.deleted.success-body')}</span>)
  }),
  error: {
    title: i18next.t('content-toasts.deleted.error-title'),
    body: i18next.t('content-toasts.deleted.error-body')
  }
};

export const changesPublished = {
  success: (content: MiniContent) => ({
    title: i18next.t('content-toasts.changesPublished.success-title'),
    body: (<span>{i18next.t('content-toasts.changesPublished.success-body')} <ContentLink {...content} newTab /> {i18next.t('content-toasts.published.success-body')}</span>)
  }),
  error: {
    title: i18next.t('content-toasts.changesPublished.error-title'),
    body: i18next.t('content-toasts.changesPublished.error-body'),
  }
};

export const startedEditing = {
  error: {
    title: i18next.t('content-toasts.startedEditing.error-title'),
    body: i18next.t('content-toasts.startedEditing.error-body'),
  }
};

export const notifiedNewTerms = {
  success: {
    title: i18next.t('content-toasts.notifiedNewTerms.success-title'),
    body: (<span><Trans i18nKey="content-toasts.notifiedNewTerms.success-body" values={{ appTermsTitle: COPY.appTermsTitle}} components={{ emphasis: <em /> }} /></span>)
  },
  error: {
    title: i18next.t('content-toasts.notifiedNewTerms.error-title'),
    body: (<span><Trans i18nKey="content-toasts.notifiedNewTerms.error-body" values={{ appTermsTitle: COPY.appTermsTitle}} components={{ emphasis: <em /> }} /></span>)
  }
};
