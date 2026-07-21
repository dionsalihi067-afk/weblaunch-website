import type { ServiceQuestionnaireConfig, ServiceId } from './types';
import { isFieldCoveredByShared } from './sharedFields';

/**
 * Declarative questionnaire config — labels from
 * contact.form.questionnaire.{serviceId}.{labelKey}
 *
 * Personal/global fields (business name, contact, email, phone, country, language)
 * are NEVER asked here — they live in Step 1 only.
 *
 * Fields that overlap across selected services are promoted to the Shared step
 * via sharedFields.ts and filtered out of individual questionnaires at runtime.
 */
export const QUESTIONNAIRES: ServiceQuestionnaireConfig[] = [
  {
    id: 'website-development',
    sections: [
      {
        id: 'business',
        titleKey: 'sections.business',
        fields: [
          { id: 'describe', type: 'textarea', labelKey: 'describe', required: true },
          { id: 'products', type: 'textarea', labelKey: 'products', required: true },
          {
            id: 'websiteUrl',
            type: 'url',
            labelKey: 'websiteUrl',
            required: false,
            placeholderKey: 'websiteUrlPlaceholder',
          },
          {
            id: 'goal',
            type: 'radio',
            labelKey: 'goal',
            required: true,
            options: [
              { value: 'lead-generation', labelKey: 'options.goals.lead-generation' },
              { value: 'information', labelKey: 'options.goals.information' },
              { value: 'bookings', labelKey: 'options.goals.bookings' },
              { value: 'online-store', labelKey: 'options.goals.online-store' },
              { value: 'portfolio', labelKey: 'options.goals.portfolio' },
              { value: 'other', labelKey: 'options.goals.other' },
            ],
            otherValue: 'other',
            otherFieldId: 'goalOther',
            otherLabelKey: 'goalOther',
          },
          {
            id: 'pages',
            type: 'checkbox',
            labelKey: 'pages',
            required: true,
            options: [
              { value: 'home', labelKey: 'options.pages.home' },
              { value: 'about', labelKey: 'options.pages.about' },
              { value: 'services', labelKey: 'options.pages.services' },
              { value: 'products', labelKey: 'options.pages.products' },
              { value: 'gallery', labelKey: 'options.pages.gallery' },
              { value: 'blog', labelKey: 'options.pages.blog' },
              { value: 'faq', labelKey: 'options.pages.faq' },
              { value: 'contact', labelKey: 'options.pages.contact' },
              { value: 'portfolio', labelKey: 'options.pages.portfolio' },
              { value: 'other', labelKey: 'options.pages.other' },
            ],
            otherValue: 'other',
            otherFieldId: 'pagesOther',
            otherLabelKey: 'pagesOther',
          },
        ],
      },
      {
        id: 'design',
        titleKey: 'sections.design',
        fields: [
          { id: 'style', type: 'textarea', labelKey: 'style', required: true },
          {
            id: 'reference',
            type: 'text',
            labelKey: 'reference',
            required: false,
            placeholderKey: 'referencePlaceholder',
          },
        ],
      },
      {
        id: 'files',
        titleKey: 'sections.files',
        fields: [
          {
            id: 'logo',
            type: 'file',
            labelKey: 'logo',
            accept: 'image/*,.pdf,.ai,.eps,.svg',
            multiple: true,
          },
          {
            id: 'photos',
            type: 'file',
            labelKey: 'photos',
            accept: 'image/*,.pdf',
            multiple: true,
          },
          {
            id: 'brandGuide',
            type: 'file',
            labelKey: 'brandGuide',
            accept: '.pdf,.doc,.docx,.zip,image/*',
            multiple: true,
          },
        ],
      },
    ],
  },
  {
    id: 'branding',
    sections: [
      {
        id: 'main',
        fields: [
          { id: 'industry', type: 'text', labelKey: 'industry', required: true },
          { id: 'describe', type: 'textarea', labelKey: 'describe', required: true },
          { id: 'logoLook', type: 'textarea', labelKey: 'logoLook', required: true },
          { id: 'colors', type: 'text', labelKey: 'colors', required: true },
          {
            id: 'references',
            type: 'textarea',
            labelKey: 'references',
            placeholderKey: 'referencesPlaceholder',
          },
          {
            id: 'logo',
            type: 'file',
            labelKey: 'logo',
            accept: 'image/*,.pdf,.ai,.eps,.svg',
            multiple: true,
          },
          {
            id: 'brandGuide',
            type: 'file',
            labelKey: 'brandGuide',
            accept: '.pdf,.doc,.docx,.zip,image/*',
            multiple: true,
          },
        ],
      },
    ],
  },
  {
    id: 'seo',
    sections: [
      {
        id: 'main',
        fields: [
          { id: 'websiteUrl', type: 'url', labelKey: 'websiteUrl', required: false },
          { id: 'mainServices', type: 'textarea', labelKey: 'mainServices', required: true },
          { id: 'cities', type: 'text', labelKey: 'cities', required: true },
          {
            id: 'keywords',
            type: 'textarea',
            labelKey: 'keywords',
            required: true,
            placeholderKey: 'keywordsPlaceholder',
          },
          { id: 'competitors', type: 'textarea', labelKey: 'competitors' },
        ],
      },
    ],
  },
  {
    id: 'google-business',
    sections: [
      {
        id: 'profile',
        titleKey: 'sections.profile',
        fields: [
          {
            id: 'exists',
            type: 'radio',
            labelKey: 'exists',
            required: true,
            options: [
              { value: 'yes', labelKey: 'common.yes' },
              { value: 'no', labelKey: 'common.no' },
            ],
          },
          { id: 'address', type: 'text', labelKey: 'address', required: true },
          {
            id: 'hours',
            type: 'text',
            labelKey: 'hours',
            required: true,
            placeholderKey: 'hoursPlaceholder',
          },
          {
            id: 'category',
            type: 'text',
            labelKey: 'category',
            required: true,
            placeholderKey: 'categoryPlaceholder',
          },
        ],
      },
      {
        id: 'credentials',
        titleKey: 'sections.credentials',
        fields: [
          {
            id: 'loginEmail',
            type: 'email',
            labelKey: 'loginEmail',
            required: true,
          },
          {
            id: 'loginPassword',
            type: 'password',
            labelKey: 'loginPassword',
            required: true,
            helperKey: 'credentialsNotice',
          },
        ],
      },
    ],
  },
  {
    id: 'social-setup',
    sections: [
      {
        id: 'setup',
        titleKey: 'sections.setup',
        fields: [
          {
            id: 'platforms',
            type: 'checkbox',
            labelKey: 'platforms',
            required: true,
            options: [
              { value: 'facebook', labelKey: 'options.platforms.facebook' },
              { value: 'instagram', labelKey: 'options.platforms.instagram' },
              { value: 'tiktok', labelKey: 'options.platforms.tiktok' },
              { value: 'linkedin', labelKey: 'options.platforms.linkedin' },
              { value: 'youtube', labelKey: 'options.platforms.youtube' },
            ],
          },
          { id: 'describe', type: 'textarea', labelKey: 'describe', required: true },
          {
            id: 'logo',
            type: 'file',
            labelKey: 'logo',
            accept: 'image/*,.pdf,.ai,.eps,.svg',
            multiple: true,
          },
          {
            id: 'brandGuide',
            type: 'file',
            labelKey: 'brandGuide',
            accept: '.pdf,.doc,.docx,.zip,image/*',
            multiple: true,
          },
        ],
      },
      {
        id: 'credentials',
        titleKey: 'sections.credentials',
        fields: [
          {
            id: 'facebookLogin',
            type: 'text',
            labelKey: 'facebookLogin',
            required: true,
          },
          {
            id: 'facebookPassword',
            type: 'password',
            labelKey: 'facebookPassword',
            required: true,
            helperKey: 'credentialsNotice',
          },
          {
            id: 'instagramUsername',
            type: 'text',
            labelKey: 'instagramUsername',
            required: true,
          },
          {
            id: 'instagramPassword',
            type: 'password',
            labelKey: 'instagramPassword',
            required: true,
          },
          { id: 'tiktokUsername', type: 'text', labelKey: 'tiktokUsername' },
          { id: 'tiktokPassword', type: 'password', labelKey: 'tiktokPassword' },
          { id: 'linkedinUsername', type: 'text', labelKey: 'linkedinUsername' },
          { id: 'linkedinPassword', type: 'password', labelKey: 'linkedinPassword' },
        ],
      },
    ],
  },
  {
    id: 'social-management',
    sections: [
      {
        id: 'plan',
        titleKey: 'sections.plan',
        fields: [
          {
            id: 'objective',
            type: 'radio',
            labelKey: 'objective',
            required: true,
            options: [
              { value: 'brand-awareness', labelKey: 'options.objectives.brand-awareness' },
              { value: 'lead-generation', labelKey: 'options.objectives.lead-generation' },
              { value: 'sales', labelKey: 'options.objectives.sales' },
              { value: 'follower-growth', labelKey: 'options.objectives.follower-growth' },
            ],
          },
          {
            id: 'platforms',
            type: 'checkbox',
            labelKey: 'platforms',
            required: true,
            options: [
              { value: 'facebook', labelKey: 'options.platforms.facebook' },
              { value: 'instagram', labelKey: 'options.platforms.instagram' },
              { value: 'tiktok', labelKey: 'options.platforms.tiktok' },
              { value: 'linkedin', labelKey: 'options.platforms.linkedin' },
              { value: 'youtube', labelKey: 'options.platforms.youtube' },
            ],
          },
          {
            id: 'postsPerMonth',
            type: 'text',
            labelKey: 'postsPerMonth',
            required: true,
            placeholderKey: 'postsPlaceholder',
          },
        ],
      },
      {
        id: 'assets',
        titleKey: 'sections.assets',
        fields: [
          {
            id: 'logo',
            type: 'file',
            labelKey: 'logo',
            accept: 'image/*,.pdf,.ai,.eps,.svg',
            multiple: true,
          },
          {
            id: 'photos',
            type: 'file',
            labelKey: 'photos',
            accept: 'image/*',
            multiple: true,
          },
          {
            id: 'videos',
            type: 'file',
            labelKey: 'videos',
            accept: 'video/*',
            multiple: true,
          },
          {
            id: 'brandGuide',
            type: 'file',
            labelKey: 'brandGuide',
            accept: '.pdf,.doc,.docx,.zip,image/*',
            multiple: true,
          },
        ],
      },
      {
        id: 'credentials',
        titleKey: 'sections.credentials',
        fields: [
          { id: 'facebookLogin', type: 'text', labelKey: 'facebookLogin' },
          { id: 'instagramLogin', type: 'text', labelKey: 'instagramLogin' },
        ],
      },
    ],
  },
  {
    id: 'ads',
    sections: [
      {
        id: 'campaign',
        titleKey: 'sections.campaign',
        fields: [
          {
            id: 'objective',
            type: 'radio',
            labelKey: 'objective',
            required: true,
            options: [
              { value: 'lead-generation', labelKey: 'options.objectives.lead-generation' },
              { value: 'traffic', labelKey: 'options.objectives.traffic' },
              { value: 'sales', labelKey: 'options.objectives.sales' },
              { value: 'messages', labelKey: 'options.objectives.messages' },
            ],
          },
          { id: 'budget', type: 'text', labelKey: 'budget', required: true },
          {
            id: 'targetArea',
            type: 'text',
            labelKey: 'targetArea',
            required: true,
            placeholderKey: 'targetPlaceholder',
          },
          { id: 'offer', type: 'textarea', labelKey: 'offer', required: true },
        ],
      },
      {
        id: 'credentials',
        titleKey: 'sections.credentials',
        fields: [
          {
            id: 'bmEmail',
            type: 'email',
            labelKey: 'bmEmail',
            required: true,
          },
          {
            id: 'bmPassword',
            type: 'password',
            labelKey: 'bmPassword',
            required: true,
            helperKey: 'credentialsNotice',
          },
          { id: 'adAccountId', type: 'text', labelKey: 'adAccountId' },
        ],
      },
      {
        id: 'creatives',
        titleKey: 'sections.creatives',
        fields: [
          {
            id: 'images',
            type: 'file',
            labelKey: 'images',
            accept: 'image/*',
            multiple: true,
          },
          {
            id: 'videos',
            type: 'file',
            labelKey: 'videos',
            accept: 'video/*',
            multiple: true,
          },
        ],
      },
    ],
  },
  {
    id: 'email',
    sections: [
      {
        id: 'main',
        fields: [
          { id: 'domain', type: 'text', labelKey: 'domain', required: true },
          { id: 'howMany', type: 'text', labelKey: 'howMany', required: true },
          {
            id: 'names',
            type: 'textarea',
            labelKey: 'names',
            required: true,
            placeholderKey: 'namesPlaceholder',
          },
        ],
      },
    ],
  },
  {
    id: 'lead-forms',
    sections: [
      {
        id: 'main',
        fields: [
          { id: 'purpose', type: 'textarea', labelKey: 'purpose', required: true },
          {
            id: 'fields',
            type: 'checkbox',
            labelKey: 'fields',
            required: true,
            options: [
              { value: 'name', labelKey: 'options.fields.name' },
              { value: 'surname', labelKey: 'options.fields.surname' },
              { value: 'phone', labelKey: 'options.fields.phone' },
              { value: 'email', labelKey: 'options.fields.email' },
              { value: 'company', labelKey: 'options.fields.company' },
              { value: 'message', labelKey: 'options.fields.message' },
              { value: 'file-upload', labelKey: 'options.fields.file-upload' },
              { value: 'other', labelKey: 'options.fields.other' },
            ],
            otherValue: 'other',
            otherFieldId: 'fieldsOther',
            otherLabelKey: 'fieldsOther',
          },
          {
            id: 'emailDestination',
            type: 'email',
            labelKey: 'emailDestination',
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: 'maintenance',
    sections: [
      {
        id: 'main',
        fields: [
          { id: 'websiteUrl', type: 'url', labelKey: 'websiteUrl', required: false },
          { id: 'problem', type: 'textarea', labelKey: 'problem', required: true },
          {
            id: 'tasks',
            type: 'checkbox',
            labelKey: 'tasks',
            required: true,
            options: [
              { value: 'updates', labelKey: 'options.tasks.updates' },
              { value: 'backups', labelKey: 'options.tasks.backups' },
              { value: 'content', labelKey: 'options.tasks.content' },
              { value: 'security', labelKey: 'options.tasks.security' },
              { value: 'performance', labelKey: 'options.tasks.performance' },
              { value: 'other', labelKey: 'options.tasks.other' },
            ],
            otherValue: 'other',
            otherFieldId: 'tasksOther',
            otherLabelKey: 'tasksOther',
          },
        ],
      },
    ],
  },
  {
    id: 'landing-pages',
    sections: [
      {
        id: 'main',
        fields: [
          { id: 'product', type: 'textarea', labelKey: 'product', required: true },
          {
            id: 'goal',
            type: 'radio',
            labelKey: 'goal',
            required: true,
            options: [
              { value: 'lead-generation', labelKey: 'options.goals.lead-generation' },
              { value: 'sales', labelKey: 'options.goals.sales' },
              { value: 'bookings', labelKey: 'options.goals.bookings' },
              { value: 'event', labelKey: 'options.goals.event' },
            ],
          },
          { id: 'offer', type: 'textarea', labelKey: 'offer', required: true },
          {
            id: 'action',
            type: 'radio',
            labelKey: 'action',
            required: true,
            options: [
              { value: 'submit-form', labelKey: 'options.actions.submit-form' },
              { value: 'call', labelKey: 'options.actions.call' },
              { value: 'whatsapp', labelKey: 'options.actions.whatsapp' },
              { value: 'purchase', labelKey: 'options.actions.purchase' },
              { value: 'other', labelKey: 'options.actions.other' },
            ],
            otherValue: 'other',
            otherFieldId: 'actionOther',
            otherLabelKey: 'actionOther',
          },
          {
            id: 'images',
            type: 'file',
            labelKey: 'images',
            accept: 'image/*',
            multiple: true,
          },
          {
            id: 'videos',
            type: 'file',
            labelKey: 'videos',
            accept: 'video/*',
            multiple: true,
          },
        ],
      },
    ],
  },
];

export function getQuestionnaire(serviceId: string): ServiceQuestionnaireConfig | undefined {
  return QUESTIONNAIRES.find((q) => q.id === serviceId);
}

/** Questionnaire with shared-covered fields removed for the current selection. */
export function getResolvedQuestionnaire(
  serviceId: ServiceId,
  selectedServices: ServiceId[]
): ServiceQuestionnaireConfig | undefined {
  const base = getQuestionnaire(serviceId);
  if (!base) return undefined;

  return {
    ...base,
    sections: base.sections
      .map((section) => ({
        ...section,
        fields: section.fields.filter(
          (field) => !isFieldCoveredByShared(serviceId, field.id, selectedServices)
        ),
      }))
      .filter((section) => section.fields.length > 0),
  };
}

export function getRequiredFields(serviceId: string) {
  const config = getQuestionnaire(serviceId);
  if (!config) return [];
  return config.sections.flatMap((s) => s.fields.filter((f) => f.required));
}
