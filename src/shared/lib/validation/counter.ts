import { invalid, valid, validateArray, validateGenericString, Validation} from 'shared/lib/validation';
import i18next from 'i18next';

export function validateCounterName(raw: string): Validation<string, string[]> {
  const isValid = validateGenericString(raw, i18next.t('counterName')) && raw.match(/^[a-zA-Z0-9.-]+$/);
  if (isValid) {
    return valid(raw);
  } else {
    return invalid([i18next.t('invalidCounterName')]);
  }
}

export function validateCounterNames(raw: string[]): Validation<string[], string[][]> {
  return validateArray(raw, validateCounterName);
}
