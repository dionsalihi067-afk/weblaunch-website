import type { AnswerValue, QuestionField } from './types';

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Empty values are valid (for optional fields). Non-empty values must be a plausible URL. */
export function isUrlValid(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

export function isPhoneValid(phone: string): boolean {
  const phoneRegex =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phone.trim().length >= 8 && phoneRegex.test(phone);
}

export function isEmptyAnswer(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return !value.trim();
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    if (value[0] instanceof File) return value.length === 0;
    return value.length === 0;
  }
  return false;
}

export function isOtherSelected(
  field: QuestionField,
  value: AnswerValue | undefined
): boolean {
  if (!field.otherValue) return false;
  if (typeof value === 'string') return value === field.otherValue;
  if (Array.isArray(value) && !(value[0] instanceof File)) {
    return (value as string[]).includes(field.otherValue);
  }
  return false;
}

export function validateRequiredField(
  field: QuestionField,
  value: AnswerValue | undefined,
  otherValue: AnswerValue | undefined
): boolean {
  if (!field.required) return true;
  if (isEmptyAnswer(value)) return false;
  if (isOtherSelected(field, value) && field.otherFieldId) {
    return !isEmptyAnswer(otherValue);
  }
  return true;
}
