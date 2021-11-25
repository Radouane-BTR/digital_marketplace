import { Validation, validateGenericString, valid, invalid } from 'shared/lib/validation';
import { CWUOpportunityAddendaStatus, parseCWUOpportunityAddendaStatus } from 'shared/lib/resources/addendum';

export function validateAddendumText(raw: string): Validation<string> {
  return validateGenericString(raw, 'Addendum', 1, 5000);
}

export function validateCWUOpportunityStatus(raw: string, isOneOf: CWUOpportunityAddendaStatus[]): Validation<CWUOpportunityAddendaStatus> {
  const parsed = parseCWUOpportunityAddendaStatus(raw);
  if (!parsed) { return invalid([`"${raw}" is not a valid CodeWithUs opportunity addenda status.`]); }
  if (!isOneOf.includes(parsed)) {
    return invalid([`"${raw}" is not one of: ${isOneOf.join(', ')}`]);
  }
  return valid(parsed);
}