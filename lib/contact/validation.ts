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

/** Accepts common international formats, e.g. "+383 45 949 507"; 7–15 digits (E.164). */
export function isPhoneValid(phone: string): boolean {
  const trimmed = phone.trim();
  if (!/^\+?[0-9\s().-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '').length;
  return digits >= 7 && digits <= 15;
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
