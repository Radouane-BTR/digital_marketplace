import { UserSlim } from 'shared/lib/resources/user';
import { Id } from 'shared/lib/types';

export enum CWUOpportunityAddendaStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Deleted = 'DELETED'
};

export function parseCWUOpportunityAddendaStatus(raw: string): CWUOpportunityAddendaStatus | null {
  switch (raw) {
    case CWUOpportunityAddendaStatus.Draft: return CWUOpportunityAddendaStatus.Draft;
    case CWUOpportunityAddendaStatus.Published: return CWUOpportunityAddendaStatus.Published;
    default: return null;
  }
}

export interface Addendum {
  id: Id;
  createdAt: Date;
  createdBy?: UserSlim;
  updatedAt?: Date;
  updatedBy?: UserSlim;
  description: string;
  status: CWUOpportunityAddendaStatus;
}

export function canCWUOpportunityAddendumBeDeleted(o: CWUOpportunityAddendaStatus): boolean {
  switch (o) {
    case CWUOpportunityAddendaStatus.Draft:
      return true;
    default:
      return false;
  }
}