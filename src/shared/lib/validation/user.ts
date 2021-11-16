import { parseUserStatus, parseUserType, UserStatus, UserType } from 'shared/lib/resources/user';
import { ArrayValidation, invalid, valid, validateCapabilities as validateCapabilitiesShared, validateGenericString, Validation } from 'shared/lib/validation';
import i18next from 'i18next';

export { validateEmail } from 'shared/lib/validation';

export function validateCapabilities(raw: string[]): ArrayValidation<string> {
  return validateCapabilitiesShared(raw, 0);
}

export function validateName(name: string): Validation<string> {
  return validateGenericString(name, i18next.t('name'));
}

export function validateJobTitle(v: string): Validation<string> {
  return validateGenericString(v, i18next.t('jobTitle'), 0);
}

export function validateLocale(v: string): Validation<string> {
  return validateGenericString(v, i18next.t('locale'), 0);
}

export function validateUserType(type: string): Validation<UserType> {
  const userType = parseUserType(type);
  return userType ? valid(userType) : invalid([i18next.t('invalidUserSpecified')]);
}

export function validateUserStatus(status: string): Validation<UserStatus> {
  const userStatus = parseUserStatus(status);
  return userStatus ? valid(userStatus) : invalid([i18next.t('invaliStatusSpecified')]);
}
