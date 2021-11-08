import { UserSlim } from 'shared/lib/resources/user';
import { Id } from 'shared/lib/types';

export enum CWUOpportunityAddendaStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Deleted = 'DELETED'
};
export interface Addendum {
  id: Id;
  createdAt: Date;
  createdBy?: UserSlim;
  updatedAt?: Date;
  updatedBy?: UserSlim;
  description: string;
  status: CWUOpportunityAddendaStatus;
}
