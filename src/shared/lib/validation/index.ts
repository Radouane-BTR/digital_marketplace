import * as immutable from 'immutable';
import { uniq } from 'lodash';
import moment from 'moment';
import { compareDates, countWords, formatAmount, formatDate, formatDateAndTime, formatTime } from 'shared/lib';
import CAPABILITIES from 'shared/lib/data/capabilities';
import { adt, ADT, Id } from 'shared/lib/types';
import i18next from 'i18next';

export type ErrorTypeFrom<T> = {
  [p in keyof T]?: string[];
};

export type Valid<T> = ADT<'valid', T>;

export function valid<T>(value: T): Valid<T> {
  return adt('valid', value);
}

export type Invalid<T> = ADT<'invalid', T>;

export function invalid<T>(value: T): Invalid<T> {
  return adt('invalid', value);
}

export type Validation<A, B = string[]>
  = Valid<A>
  | Invalid<B>;

export type ArrayValidation<Value, Errors = string[]> = Validation<Value[], Errors[]>;

export function isValid<Valid>(value: Validation<Valid, any>): value is ADT<'valid', Valid> {
  return value.tag === 'valid';
}

export function isInvalid<Invalid>(value: Validation<any, Invalid>): value is ADT<'invalid', Invalid> {
  return value.tag === 'invalid';
}

export function allValid(results: Array<Validation<any, any>>): results is Array<ADT<'valid', any>> {
  for (const result of results) {
    if (result.tag === 'invalid') {
      return false;
    }
  }
  return true;
}

export function allInvalid(results: Array<Validation<any, any>>): results is Array<ADT<'invalid', any>> {
  for (const result of results) {
    if (result.tag === 'valid') {
      return false;
    }
  }
  return true;
}

export function getValidValue<Valid, Fallback = Valid>(result: Validation<Valid, any>, fallback: Fallback): Valid | Fallback {
  switch (result.tag) {
    case 'valid':
      return result.value;
    case 'invalid':
      return fallback;
  }
}

export function getInvalidValue<Invalid, Fallback = Invalid>(result: Validation<any, Invalid>, fallback: Fallback): Invalid | Fallback {
  switch (result.tag) {
    case 'valid':
      return fallback;
    case 'invalid':
      return result.value;
  }
}

export function mapValid<A, B, C>(value: Validation<A, B>, fn: (b: A) => C): Validation<C, B> {
  switch (value.tag) {
    case 'valid':
      return valid(fn(value.value));
    case 'invalid':
      return value;
  }
}

export function mapInvalid<A, B, C>(value: Validation<A, B>, fn: (b: B) => C): Validation<A, C> {
  switch (value.tag) {
    case 'valid':
      return value;
    case 'invalid':
      return invalid(fn(value.value));
  }
}

export function validateThenMapValid<A, B, C>(validate: (_: A) => Validation<A, B>, fn: (_: A) => C): (_: A) => Validation<C, B> {
  return a => mapValid(validate(a), fn);
}

export function validateThenMapInvalid<A, B, C>(validate: (_: A) => Validation<A, B>, fn: (_: B) => C): (_: A) => Validation<A, C> {
  return a => mapInvalid(validate(a), fn);
}

// Array Validators.

export function validateArrayCustom<A, B, C>(raw: A[], validate: (v: A) => Validation<B, C>, defaultInvalidValue: C): ArrayValidation<B, C> {
  const validations = raw.map(v => validate(v));
  if (allValid(validations)) {
    return valid(validations.map(({ value }) => value));
  } else {
    return invalid(validations.map(validation => getInvalidValue(validation, defaultInvalidValue)));
  }
}

export function validateArray<A, B>(raw: A[], validate: (v: A) => Validation<B>): ArrayValidation<B> {
  return validateArrayCustom(raw, validate, []);
}

export async function validateArrayAsync<A, B>(raw: A[], validate: (v: A) => Promise<Validation<B>>): Promise<ArrayValidation<B>> {
  const validations = await Promise.all(raw.map(v => validate(v)));
  if (allValid(validations)) {
    return valid<B[]>(validations.map(({ value }) => value));
  } else {
    return invalid<string[][]>(validations.map(validation => getInvalidValue(validation, [])));
  }
}

export async function validateArrayCustomAsync<A, B, C>(raw: A[], validate: (v: A) => Promise<Validation<B, C>>, defaultInvalidValue: C): Promise<ArrayValidation<B, C>> {
  const validations = await Promise.all(raw.map(v => validate(v)));
  if (allValid(validations)) {
    return valid(validations.map(({ value }) => value));
  } else {
    return invalid(validations.map(validation => getInvalidValue(validation, defaultInvalidValue)));
  }
}

// Single Value Validators.

type OptionalNotDefined = undefined | null | '';

function isOptionalNotDefined<Value>(v: Value | OptionalNotDefined): v is OptionalNotDefined {
  return v === null || v === undefined || v === '';
}

// Validate a field only if it is truthy.
export function optional<Value, Valid, Invalid>(v: Value | OptionalNotDefined, validate: (v: Value) => Validation<Valid, Invalid>): Validation<Valid | undefined, Invalid> {
  return isOptionalNotDefined(v) ? valid(undefined) : validate(v as Value);
}

export async function optionalAsync<Value, Valid, Invalid>(v: Value | OptionalNotDefined, validate: (v: Value) => Promise<Validation<Valid, Invalid>>): Promise<Validation<Valid | undefined, Invalid>> {
  return isOptionalNotDefined(v) ? valid<undefined>(undefined) : await validate(v as Value);
}

export function validateGenericString(value: string, name: string, min = 1, max = 100, characters = i18next.t('characters')): Validation<string> {
  if (value.length < min || value.length > max) {
    return invalid([i18next.t('validateGenericStringWordsText',{name: name, min: min, max: max, text: characters})]);
  } else {
    return valid(value);
  }
}

export function validateGenericStringWords(value: string, name: string, min = 1, max = 3000, words = i18next.t('words')): Validation<string> {
  const count = countWords(value);
  if (count < min || count > max) {
    return invalid([i18next.t('validateGenericStringWordsText',{name: name, min: min, max: max, text: words})]);
  } else {
    return valid(value);
  }
}

export function validateStringInArray(value: string, availableValues: immutable.Set<string>, name: string, indefiniteArticle =  i18next.t('a'), caseSensitive = false): Validation<string> {
  if (!value) {
    return invalid([i18next.t('validateStringInArray.isNotSelected',{article: indefiniteArticle, text: name})]);
  }
  if (!caseSensitive) {
    availableValues = availableValues.map(v => v.toUpperCase());
    value = value.toUpperCase();
  }
  if (!availableValues.includes(value)) {
    return invalid([i18next.t('validateStringInArray.isNotSelected',{value: value, text: name})]);
  } else {
    return valid(value);
  }
}

export function validateNumber(raw: string | number, min?: number, max?: number, name =  i18next.t('number'), article = i18next.t('a'), format = true, integer = true): Validation<number> {
  const parsed = integer ? parseInt(`${raw}`, 10) : parseFloat(`${raw}`);
  if (isNaN(parsed)) { return invalid([i18next.t('validateNumber.isNotValidText', {name: name})]); }
  const errors: string[] = [];
  if (min !== undefined && parsed < min) {
    errors.push(i18next.t('validateNumber.isMinText', {article: article, name: name, value: format ? formatAmount(min) : min}));
  }
  if (max !== undefined && parsed > max) {
    errors.push(i18next.t('validateNumber.isMaxText', {article: article, name: name, value: format ? formatAmount(max) : max}));
  }
  if (errors.length) {
    return invalid(errors);
  }
  return valid(parsed);
}

export function validateNumberWithPrecision(raw: string | number, min?: number, max?: number, maxPrecision = 5, name =  i18next.t('number'), article = i18next.t('a'), format = true): Validation<number> {
  const validatedNumber = validateNumber(raw, min, max, name, article, format, false);
  if (isInvalid(validatedNumber)) {
    return validatedNumber;
  }
  const parts = validatedNumber.value.toString().split('.');
  if (parts.length > 1 && parts[1].length > maxPrecision) {
    return invalid([i18next.t('invalidNumberWithPrecision', {article: article, name: name, maxPrecision: maxPrecision})]);
  }
  return validatedNumber;
}

// Date Validators.

function parseDate(raw: string): Date | null {
  const parsed = moment(raw);
  return parsed.isValid() ? parsed.toDate() : null;
}

export function validateGenericDate(raw: string, name: string, preposition: string, format: (d: Date) => string, minDate?: Date, maxDate?: Date, modifyParsed?: (_: Date) => Date): Validation<Date> {
  let date: Date | null = parseDate(raw);
  if (!date) {
    return invalid([i18next.t('invalidDate')]);
  }
  date = modifyParsed ? modifyParsed(date) : date;
  const validMinDate = !minDate || compareDates(date, minDate) !== -1;
  const validMaxDate = !maxDate || compareDates(date, maxDate) !== 1;
  if (validMinDate && validMaxDate) {
    return valid(date);
  } else {
    const errors: string[] = [];
    if (!validMinDate && minDate) {
      errors.push(`${i18next.t('invalidMinMaxDate', {name: name})} ${preposition ? `${preposition} ${i18next.t('or')} ` : ''}${i18next.t('after')} ${format(minDate)}.`);
    }
    if (!validMaxDate && maxDate) {
      errors.push(`${i18next.t('invalidMinMaxDate', {name: name})} ${preposition ? `${preposition} ${i18next.t('or')} ` : ''}${i18next.t('earlierThan')} ${format(maxDate)}.`);
    }
    return invalid(errors);
  }
}

export function validateDatetime(raw: string, minDate?: Date, maxDate?: Date, modifyParsed?: (_: Date) => Date): Validation<Date> {
  return validateGenericDate(raw, i18next.t('date/time'), i18next.t('at'), formatDateAndTime, minDate, maxDate, modifyParsed);
}

export function validateDate(raw: string, minDate?: Date, maxDate?: Date, modifyParsed?: (_: Date) => Date): Validation<Date> {
  return validateGenericDate(raw, 'date', i18next.t('on'), formatDate, minDate, maxDate, modifyParsed);
}

export function validateTime(raw: string, minDate?: Date, maxDate?: Date): Validation<Date> {
  return validateGenericDate(raw, i18next.t('time'), i18next.t('at'), formatTime, minDate, maxDate);
}

export function validateUrl(url: string): Validation<string> {
  url = url.toLowerCase();
  if (!url.match(/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i)) {
    return invalid([i18next.t('invalidUrl')]);
  } else {
    return valid(url);
  }
}

export function validatePhoneNumber(phone: string): Validation<string> {
  if (!phone.match(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i)) {
    return invalid([i18next.t('invalidPhoneNumber')]);
  } else {
    return valid(phone);
  }
}

export function validateEmail(email: string): Validation<string> {
  email = email.toLowerCase();
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/i)) {
    return invalid([i18next.t('invalidEmail')]);
  } else {
    return valid(email);
  }
}

// UUID v4 RegExp
export const UUID_REGEXP = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Validates a v4 UUID
export function validateUUID(raw: string): Validation<Id> {
  if (!raw.match(UUID_REGEXP)) {
    return invalid([i18next.t('invalidateUUID')]);
  } else {
    return valid(raw);
  }
}

// Validate capabilities for SWU opportunities and proposals
export function validateCapability(raw: string): Validation<string> {
  return CAPABILITIES.includes(raw) ? valid(raw) : invalid([i18next.t('invalidCapability')]);
}

export function validateCapabilities(raw: string[], minCapabilities = 1): ArrayValidation<string> {
  if (raw.length < minCapabilities) { return invalid([[`${i18next.t('invalidCapabilities', {minCapabilities: minCapabilities})} ${minCapabilities === 1 ? i18next.t('team-member.capability') : i18next.t('team-member.capabilities')}.`]]); }
  const validatedArray = validateArray(raw, validateCapability);
  return mapValid(validatedArray, v => uniq(v));
}

// Validate pagination index and size query params
export function validatePageIndex(raw: string | number | undefined): Validation<number> {
  return validateNumber(raw || 0, 1);
}

export function validatePageSize(raw: string | number | undefined): Validation<number> {
  return validateNumber(raw || 0, 1);
}
