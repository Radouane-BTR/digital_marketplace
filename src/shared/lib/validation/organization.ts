import { optional, validateEmail, validateGenericString, validatePhoneNumber, validateUrl, Validation } from 'shared/lib/validation';
import i18next from 'i18next';

export function validateLegalName(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('legalName'));
}

export function validateWebsiteUrl(raw: string | undefined): Validation<string | undefined> {
  return optional(raw, validateUrl);
}

export function validateStreetAddress1(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('form.street-sddress'));
}

export function validateStreetAddress2(raw: string | undefined): Validation<string | undefined> {
  return optional(raw, v => validateGenericString(v, i18next.t('form.street-sddress')));
}

export function validateCity(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('form.city'));
}

export function validateRegion(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('region'));
}

export function validateMailCode(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('mailCode'));
}

export function validateCountry(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('from.country'));
}

export function validateContactName(raw: string): Validation<string> {
  return validateGenericString(raw,  i18next.t('from.contact-name'));
}

export function validateContactTitle(raw: string | undefined): Validation<string | undefined> {
  return optional(raw, v => validateGenericString(v, i18next.t('contactTitle')));
}

export function validateContactEmail(raw: string): Validation<string> {
  return validateEmail(raw);
}

export function validateContactPhone(raw: string | undefined): Validation<string | undefined> {
  return optional(raw, validatePhoneNumber);
}
