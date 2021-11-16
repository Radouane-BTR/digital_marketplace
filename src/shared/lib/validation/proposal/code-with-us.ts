import { getString } from 'shared/lib';
import { CreateIndividualProponentRequestBody, CreateIndividualProponentValidationErrors, CWUProposalStatus, parseCWUProposalStatus } from 'shared/lib/resources/proposal/code-with-us';
import { allValid, getInvalidValue, invalid, mapValid, optional, valid, validateEmail, validateGenericString, validateNumberWithPrecision, validatePhoneNumber, Validation } from 'shared/lib/validation';
import i18next from 'i18next';

export function validateCWUProposalStatus(raw: string, isOneOf: CWUProposalStatus[]): Validation<CWUProposalStatus> {
  const parsed = parseCWUProposalStatus(raw);
  if (!parsed) { return invalid([i18next.t('validateCWUProposalStatus.isNotValidCWU', {raw: raw})]); }
  if (!isOneOf.includes(parsed)) {
    return invalid([`${i18next.t('validateCWUProposalStatus.isNotValidPropsals', {raw: raw})} ${isOneOf.join(', ')}`]);
  }
  return valid(parsed);
}

export function validateProposalText(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('proposalText'), 1, 10000);
}

export function validateAdditionalComments(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('additionalComments'), 0, 10000);
}

export function validateNote(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('note'), 0, 5000);
}

export function validateDisqualificationReason(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('disqualificationReason'), 1, 5000);
}

export function validateScore(raw: number): Validation<number> {
  return validateNumberWithPrecision(raw, 0, 100, 2, i18next.t('score'), i18next.t('a'), false);
}

export function validateIndividualProponentLegalName(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('legalName'), 1);
}

export function validateIndividualProponentEmail(raw: string): Validation<string> {
  return validateEmail(raw);
}

export function validateIndividualProponentPhone(raw: string | undefined): Validation<string> {
  return mapValid(optional(raw, v => validatePhoneNumber(v)), w => w || '');
}

export function validateIndividualProponentStreet1(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('form.street-sddress'), 1);
}

export function validateIndividualProponentStreet2(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('form.street-sddress'), 0);
}

export function validateIndividualProponentCity(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('form.city'), 1);
}

export function validateIndividualProponentRegion(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('from.province-state'), 1);
}

export function validateIndividualProponentMailCode(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('from.postal-zipCode'), 1);
}

export function validateIndividualProponentCountry(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('from.country'), 1);
}

export function validateIndividualProponent(raw: any): Validation<CreateIndividualProponentRequestBody, CreateIndividualProponentValidationErrors> {
  const validatedLegalName = validateIndividualProponentLegalName(getString(raw, 'legalName'));
  const validatedEmail = validateIndividualProponentEmail(getString(raw, 'email'));
  const validatedPhone = optional(getString(raw, 'phone'), validateIndividualProponentPhone);
  const validatedStreet1 = validateIndividualProponentStreet1(getString(raw, 'street1'));
  const validatedStreet2 = optional(getString(raw, 'street2'), validateIndividualProponentStreet2);
  const validatedCity = validateIndividualProponentCity(getString(raw, 'city'));
  const validatedRegion = validateIndividualProponentRegion(getString(raw, 'region'));
  const validatedMailCode = validateIndividualProponentMailCode(getString(raw, 'mailCode'));
  const validatedCountry  = validateIndividualProponentCountry(getString(raw, 'country'));

  if (allValid([
    validatedLegalName,
    validatedEmail,
    validatedPhone,
    validatedStreet1,
    validatedStreet2,
    validatedCity,
    validatedRegion,
    validatedMailCode,
    validatedCountry
  ])) {
    return valid({
      legalName: validatedLegalName.value,
      email: validatedEmail.value,
      phone: validatedPhone.value,
      street1: validatedStreet1.value,
      street2: validatedStreet2.value,
      city: validatedCity.value,
      region: validatedRegion.value,
      mailCode: validatedMailCode.value,
      country: validatedCountry.value
    } as CreateIndividualProponentRequestBody);
  } else {
    return invalid({
      legalName: getInvalidValue(validatedLegalName, undefined),
      email: getInvalidValue(validatedEmail, undefined),
      phone: getInvalidValue(validatedPhone, undefined),
      street1: getInvalidValue(validatedStreet1, undefined),
      street2: getInvalidValue(validatedStreet2, undefined),
      city: getInvalidValue(validatedCity, undefined),
      region: getInvalidValue(validatedRegion, undefined),
      mailCode: getInvalidValue(validatedMailCode, undefined),
      country: getInvalidValue(validatedCountry, undefined)
    });
  }
}
