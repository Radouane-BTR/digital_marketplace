import { Validation, validateGenericString } from 'shared/lib/validation';
import i18next from 'i18next';

export function validateAddendumText(raw: string): Validation<string> {
  return validateGenericString(raw, i18next.t('addendum'), 1, 5000);
}
