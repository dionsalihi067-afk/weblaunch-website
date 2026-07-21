export const SERVICE_IDS = [
  'website-development',
  'branding',
  'seo',
  'google-business',
  'social-setup',
  'social-management',
  'ads',
  'email',
  'lead-forms',
  'maintenance',
  'landing-pages',
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'password'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'file';

export interface FieldOption {
  value: string;
  /** Translation key under contact.form.questionnaire.{service}.options.{optionKey} or absolute under options */
  labelKey: string;
}

export interface QuestionField {
  id: string;
  type: FieldType;
  /** Relative key under contact.form.questionnaire.{serviceId} */
  labelKey: string;
  placeholderKey?: string;
  required?: boolean;
  options?: FieldOption[];
  /** When checkbox/radio includes "other", show text field for this id */
  otherValue?: string;
  otherFieldId?: string;
  otherLabelKey?: string;
  accept?: string;
  multiple?: boolean;
  helperKey?: string;
}

export interface QuestionSection {
  id: string;
  titleKey?: string;
  fields: QuestionField[];
}

export interface ServiceQuestionnaireConfig {
  id: ServiceId;
  sections: QuestionSection[];
}

export type AnswerValue = string | string[] | File[];

export interface ContactFormState {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  country: string;
  preferredLanguage: string;
  selectedServices: ServiceId[];
  /** Answers shared across multiple selected services (asked once). */
  sharedAnswers: Record<string, AnswerValue>;
  serviceAnswers: Record<string, Record<string, AnswerValue>>;
  additionalNotes: string;
}

export const PREFERRED_LANGUAGES = [
  'albanian',
  'english',
  'german',
  'french',
  'italian',
  'turkish',
  'spanish',
] as const;

export type PreferredLanguage = (typeof PREFERRED_LANGUAGES)[number];
