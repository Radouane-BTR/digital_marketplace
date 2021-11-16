import { invalid, valid, validateGenericString, Validation } from 'shared/lib/validation';
import i18next from 'i18next';

export function validateTitle(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('title'), 1, 100);
}

export function validateBody(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('body'), 1, 50000);
}

export function validateSlug(raw: string): Validation<string> {
  if (!raw.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
    return invalid([ i18next.t('invalidSlug') ]);
  } else {
    return valid(raw);
  }
}
