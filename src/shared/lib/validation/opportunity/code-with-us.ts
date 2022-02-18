import { uniq } from 'lodash';
import { CWU_MAX_BUDGET } from 'shared/config';
import { setDateTo4PM } from 'shared/lib';
import { CreateCWUOpportunityStatus, CWUOpportunity, CWUOpportunityStatus, isCWUOpportunityClosed, parseCWUOpportunityStatus } from 'shared/lib/resources/opportunity/code-with-us';
import { ArrayValidation, invalid, mapValid, optional, valid, validateArray, validateDate, validateGenericString, validateNumber, Validation } from 'shared/lib/validation';
import { isBoolean } from 'util';
import i18next from 'i18next';

export { validateAddendumText } from 'shared/lib/validation/addendum';

export function validateCWUOpportunityStatus(raw: string, isOneOf: CWUOpportunityStatus[]): Validation<CWUOpportunityStatus> {
  const parsed = parseCWUOpportunityStatus(raw);
  if (!parsed) { return invalid([i18next.t('validateCWUOpportunityStatus.isNotValidCWU', {raw: raw})]); }
  if (!isOneOf.includes(parsed)) {
    return invalid([`${i18next.t('validateCWUOpportunityStatus.isNotValidOpportunities', {raw: raw})} ${isOneOf.join(', ')}`]);
  }
  return valid(parsed);
}

export function validateCreateCWUOpportunityStatus(raw: string): Validation<CreateCWUOpportunityStatus> {
  return validateCWUOpportunityStatus(raw, [CWUOpportunityStatus.Draft, CWUOpportunityStatus.Published]) as Validation<CreateCWUOpportunityStatus>;
}

export function validateTitle(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('title'), 1, 200);
}

export function validateTeaser(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('teaser'), 0, 500);
}

export function validateRemoteOk(raw: any): Validation<boolean> {
  return isBoolean(raw) ? valid(raw) : invalid([i18next.t('isNotValideRemoteOption')]);
}

export function validateRemoteDesc(raw: string, remoteOk: boolean): Validation<string> {
  return validateGenericString(raw, i18next.t('overviewViewRemoteYesLabel'), remoteOk ? 1 : 0, 500);
}

export function validateLocation(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('location'), 1);
}

export function validateReward(raw: string | number): Validation<number> {
  return validateNumber(raw, 1, CWU_MAX_BUDGET, i18next.t('reward'), i18next.t('a'));
}

export function validateSkills(raw: string[]): ArrayValidation<string> {
  if (!raw.length) { return invalid([[i18next.t('isNotvalideSkills')]]); }
  const validatedArray = validateArray(raw, v => validateGenericString(v, i18next.t('skill'), 1, 100));
  return mapValid(validatedArray, skills => uniq(skills));
}

export function validateDescription(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('description'), 1, 10000);
}

export function validateProposalDeadline(raw: string, opportunity?: CWUOpportunity): Validation<Date> {
  const now = new Date();
  let minDate = now;
  if (opportunity && isCWUOpportunityClosed(opportunity)) {
    minDate = opportunity.proposalDeadline;
  }
  return validateDate(raw, setDateTo4PM(minDate), undefined, setDateTo4PM);
}

export function validateAssignmentDate(raw: string, proposalDeadline: Date): Validation<Date> {
  return validateDate(raw, setDateTo4PM(proposalDeadline), undefined, setDateTo4PM);
}

export function validateStartDate(raw: string, assignmentDate: Date): Validation<Date> {
  return validateDate(raw, setDateTo4PM(assignmentDate), undefined, setDateTo4PM);
}

export function validateCompletionDate(raw: string | undefined, startDate: Date): Validation<Date | undefined> {
  return optional(raw, v => validateDate(v, setDateTo4PM(startDate), undefined, setDateTo4PM));
}

export function validateSubmissionInfo(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('projectSubmissionInfo'), 0, 500);
}

export function validateAcceptanceCriteria(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('acceptantceCriterie'), 1, 5000);
}

export function validateEvaluationCriteria(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('evaluationCriteria'), 1, 2000);
}

export function validateNote(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('statusNote'), 0, 1000);
}
