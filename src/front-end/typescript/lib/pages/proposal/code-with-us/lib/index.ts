import { ThemeColor } from 'front-end/lib/types';
import { CWUProposalEvent, CWUProposalStatus } from 'shared/lib/resources/proposal/code-with-us';
import { UserType } from 'shared/lib/resources/user';
import i18next from 'i18next';

export function cwuProposalStatusToColor(s: CWUProposalStatus, viewerUserType: UserType): ThemeColor {
  switch (s) {
    case CWUProposalStatus.Draft        : return 'secondary';
    case CWUProposalStatus.Submitted    : return 'success';
    case CWUProposalStatus.UnderReview  : return 'warning';
    case CWUProposalStatus.Evaluated    : return viewerUserType === UserType.Vendor ? 'warning' : 'primary';
    case CWUProposalStatus.Awarded      : return 'success';
    case CWUProposalStatus.NotAwarded   : return 'primary';
    case CWUProposalStatus.Disqualified : return 'danger';
    case CWUProposalStatus.Withdrawn    : return 'danger';
  }
}

export function cwuProposalStatusToTitleCase(s: CWUProposalStatus, viewerUserType: UserType): string {
  switch (s) {
    case CWUProposalStatus.Draft        : return i18next.t('draft');
    case CWUProposalStatus.Submitted    : return i18next.t('submitted');
    case CWUProposalStatus.UnderReview  : return i18next.t('underReview');
    case CWUProposalStatus.Evaluated    : return viewerUserType === UserType.Vendor ? i18next.t('underReview') : i18next.t('evaluated');
    case CWUProposalStatus.Awarded      : return i18next.t('awarded');
    case CWUProposalStatus.NotAwarded   : return i18next.t('notAwarded');
    case CWUProposalStatus.Disqualified : return i18next.t('disqualified');
    case CWUProposalStatus.Withdrawn    : return i18next.t('withdrawn');
  }
}

export function cwuProposalEventToTitleCase(e: CWUProposalEvent): string {
  switch (e) {
    case CWUProposalEvent.ScoreEntered  : return i18next.t('scoreEntered');
  }
}

export function cwuProposalStatusToPresentTenseVerb(s: CWUProposalStatus): string {
  switch (s) {
    case CWUProposalStatus.Draft: return i18next.t('save');
    case CWUProposalStatus.Submitted: return i18next.t('submit');
    case CWUProposalStatus.Awarded: return i18next.t('award');
    case CWUProposalStatus.Withdrawn: return i18next.t('withdrawn');
    case CWUProposalStatus.Evaluated: return i18next.t('score');
    default: return i18next.t('update');
  }
}

export function cwuProposalStatusToPastTenseVerb(s: CWUProposalStatus): string {
  switch (s) {
    case CWUProposalStatus.Draft: return i18next.t('saved');
    case CWUProposalStatus.Submitted: return i18next.t('submitted');
    case CWUProposalStatus.Awarded: return i18next.t('awarded');
    case CWUProposalStatus.Withdrawn: return i18next.t('withdrawn');
    case CWUProposalStatus.Evaluated: return i18next.t('scored');
    default: return i18next.t('update');
  }
}
