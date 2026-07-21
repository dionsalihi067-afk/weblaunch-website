import type { QuestionField, ServiceId } from './types';

/** Fields collected once and reused across services that need them. */
export type SharedFieldId =
  | 'businessDescription'
  | 'websiteUrl'
  | 'logo'
  | 'photos'
  | 'videos'
  | 'brandGuide';

export interface SharedFieldDef {
  id: SharedFieldId;
  /** Services that consume this field */
  services: ServiceId[];
  field: QuestionField;
}

/**
 * Shared field catalog.
 * Shown in the Shared step when 2+ selected services need the same field.
 * When only one selected service needs it, it stays inside that service questionnaire.
 */
export const SHARED_FIELD_DEFS: SharedFieldDef[] = [
  {
    id: 'businessDescription',
    services: ['website-development', 'branding', 'social-setup'],
    field: {
      id: 'businessDescription',
      type: 'textarea',
      labelKey: 'businessDescription',
      required: true,
    },
  },
  {
    id: 'websiteUrl',
    services: ['website-development', 'seo', 'maintenance'],
    field: {
      id: 'websiteUrl',
      type: 'url',
      labelKey: 'websiteUrl',
      required: false,
      placeholderKey: 'websiteUrlPlaceholder',
    },
  },
  {
    id: 'logo',
    services: ['website-development', 'branding', 'social-setup', 'social-management'],
    field: {
      id: 'logo',
      type: 'file',
      labelKey: 'logo',
      accept: 'image/*,.pdf,.ai,.eps,.svg',
      multiple: true,
    },
  },
  {
    id: 'photos',
    services: ['website-development', 'social-management', 'ads', 'landing-pages'],
    field: {
      id: 'photos',
      type: 'file',
      labelKey: 'photos',
      accept: 'image/*',
      multiple: true,
    },
  },
  {
    id: 'videos',
    services: ['social-management', 'ads', 'landing-pages'],
    field: {
      id: 'videos',
      type: 'file',
      labelKey: 'videos',
      accept: 'video/*',
      multiple: true,
    },
  },
  {
    id: 'brandGuide',
    services: ['branding', 'social-setup', 'social-management', 'website-development'],
    field: {
      id: 'brandGuide',
      type: 'file',
      labelKey: 'brandGuide',
      accept: '.pdf,.doc,.docx,.zip,image/*',
      multiple: true,
    },
  },
];

/** Map service-local field ids → shared field ids (for filtering duplicates). */
export const SERVICE_FIELD_TO_SHARED: Partial<
  Record<ServiceId, Partial<Record<string, SharedFieldId>>>
> = {
  'website-development': {
    describe: 'businessDescription',
    websiteUrl: 'websiteUrl',
    logo: 'logo',
    photos: 'photos',
    brandGuide: 'brandGuide',
  },
  branding: {
    describe: 'businessDescription',
    logo: 'logo',
    brandGuide: 'brandGuide',
  },
  seo: {
    websiteUrl: 'websiteUrl',
  },
  'social-setup': {
    describe: 'businessDescription',
    logo: 'logo',
    brandGuide: 'brandGuide',
  },
  'social-management': {
    logo: 'logo',
    photos: 'photos',
    videos: 'videos',
    brandGuide: 'brandGuide',
  },
  ads: {
    images: 'photos',
    videos: 'videos',
  },
  maintenance: {
    websiteUrl: 'websiteUrl',
  },
  'landing-pages': {
    images: 'photos',
    videos: 'videos',
  },
};

/** Shared fields needed by 2+ currently selected services. */
export function getActiveSharedFields(selected: ServiceId[]): SharedFieldDef[] {
  return SHARED_FIELD_DEFS.filter((def) => {
    const count = selected.filter((s) => def.services.includes(s)).length;
    return count >= 2;
  });
}

/** Whether a service-local field is covered by the active shared step. */
export function isFieldCoveredByShared(
  serviceId: ServiceId,
  fieldId: string,
  selected: ServiceId[]
): boolean {
  const sharedId = SERVICE_FIELD_TO_SHARED[serviceId]?.[fieldId];
  if (!sharedId) return false;
  return getActiveSharedFields(selected).some((f) => f.id === sharedId);
}

export function hasSharedStep(selected: ServiceId[]): boolean {
  return getActiveSharedFields(selected).length > 0;
}
