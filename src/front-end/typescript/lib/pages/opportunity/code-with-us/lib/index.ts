import * as History from 'front-end/lib/components/table/history';
import { ThemeColor } from 'front-end/lib/types';
import { CWUOpportunity, CWUOpportunityEvent, CWUOpportunityStatus, isOpen } from 'shared/lib/resources/opportunity/code-with-us';
import { isAdmin, User } from 'shared/lib/resources/user';
import i18next from 'i18next';

export function cwuOpportunityStatusToColor(s: CWUOpportunityStatus): ThemeColor {
  switch (s) {
    case CWUOpportunityStatus.Draft: return 'secondary';
    case CWUOpportunityStatus.Published: return 'success';
    case CWUOpportunityStatus.Evaluation: return 'warning';
    case CWUOpportunityStatus.Awarded: return 'success';
    case CWUOpportunityStatus.Suspended: return 'secondary';
    case CWUOpportunityStatus.Canceled: return 'danger';
  }
}

export function cwuOpportunityStatusToTitleCase(s: CWUOpportunityStatus): string {
  switch (s) {
    case CWUOpportunityStatus.Draft: return i18next.t('draft');
    case CWUOpportunityStatus.Published: return i18next.t('published');
    case CWUOpportunityStatus.Evaluation: return i18next.t('evaluation');
    case CWUOpportunityStatus.Awarded: return i18next.t('awarded');
    case CWUOpportunityStatus.Suspended: return i18next.t('suspended');
    case CWUOpportunityStatus.Canceled: return i18next.t('cancelled'); // Use British spelling for copy.
  }
}

export function cwuOpportunityToPublicStatus(o: Pick<CWUOpportunity, 'status' | 'createdBy' | 'proposalDeadline'>, viewerUser?: User): string {
  const admin = !!viewerUser && (isAdmin(viewerUser) || o.createdBy?.id === viewerUser.id);
  if (admin) {
    return cwuOpportunityStatusToTitleCase(o.status);
  } else {
    if (isOpen(o)) {
      return i18next.t('open');
    } else if (o.status === CWUOpportunityStatus.Canceled) {
      return i18next.t('canceled');
    } else {
      return i18next.t('closed');
    }
  }
}

export function cwuOpportunityToPublicColor(o: Pick<CWUOpportunity, 'status' | 'createdBy' | 'proposalDeadline'>, viewerUser?: User): ThemeColor {
  const admin = !!viewerUser && (isAdmin(viewerUser) || o.createdBy?.id === viewerUser.id);
  if (admin) {
    return cwuOpportunityStatusToColor(o.status);
  } else {
    if (isOpen(o)) {
      return 'success';
    } else {
      return 'danger';
    }
  }
}

export function cwuOpportunityStatusToPresentTenseVerb(s: CWUOpportunityStatus): string {
  switch (s) {
    case CWUOpportunityStatus.Suspended: return i18next.t('suspend');
    case CWUOpportunityStatus.Canceled: return i18next.t('cancel');
    case CWUOpportunityStatus.Published: return i18next.t('publish');
    case CWUOpportunityStatus.Awarded: return i18next.t('award');
    case CWUOpportunityStatus.Evaluation:
    case CWUOpportunityStatus.Draft:
      return i18next.t('update');
  }
}

export function cwuOpportunityStatusToPastTenseVerb(s: CWUOpportunityStatus): string {
  switch (s) {
    case CWUOpportunityStatus.Suspended: return i18next.t('suspended');
    case CWUOpportunityStatus.Canceled: return i18next.t('canceled');
    case CWUOpportunityStatus.Published: return i18next.t('published');
    case CWUOpportunityStatus.Awarded: return i18next.t('awarded');
    case CWUOpportunityStatus.Evaluation:
    case CWUOpportunityStatus.Draft:
      return i18next.t('updated');
  }
}

export function cwuOpportunityEventToTitleCase(e: CWUOpportunityEvent): string {
  switch (e) {
    case CWUOpportunityEvent.Edited: return 'Edited';
    case CWUOpportunityEvent.AddendumAdded: return 'Addendum Added';
    case CWUOpportunityEvent.AddendumAdded: return i18next.t('addendumAdded');
    case CWUOpportunityEvent.Edited: return i18next.t('edited');
  }
}

export function opportunityToHistoryItems({ history }: CWUOpportunity): History.Item[] {
  if (!history) { return []; }
  return history
    .map(s => ({
      type: {
        text: s.type.tag === 'status' ? cwuOpportunityStatusToTitleCase(s.type.value) : cwuOpportunityEventToTitleCase(s.type.value),
        color: s.type.tag === 'status' ? cwuOpportunityStatusToColor(s.type.value) : undefined
      },
      note: s.note,
      createdAt: s.createdAt,
      createdBy: s.createdBy || undefined
    }));
}
