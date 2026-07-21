'use client';

import { useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader,
  Globe,
  Palette,
  Search,
  MapPin,
  Share2,
  MessageSquare,
  Target,
  Mail,
  FileText,
  Settings,
  Rocket,
} from 'lucide-react';
import ServiceQuestionnaire from './ServiceQuestionnaire';
import SharedFieldsStep from './SharedFieldsStep';
import PrivacyNotice from './PrivacyNotice';
import {
  PREFERRED_LANGUAGES,
  SERVICE_IDS,
  type AnswerValue,
  type ContactFormState,
  type ServiceId,
} from '@/lib/contact/types';
import { getResolvedQuestionnaire } from '@/lib/contact/questionnaireConfig';
import {
  getActiveSharedFields,
  hasSharedStep,
  SERVICE_FIELD_TO_SHARED,
} from '@/lib/contact/sharedFields';
import {
  LEGAL_POLICY_VERSION,
  LEGAL_TERMS_VERSION,
} from '@/lib/legal/versions';
import {
  isEmailValid,
  isEmptyAnswer,
  isOtherSelected,
  isPhoneValid,
  isUrlValid,
  validateRequiredField,
} from '@/lib/contact/validation';

const serviceIcons: Record<ServiceId, typeof Globe> = {
  'website-development': Globe,
  branding: Palette,
  seo: Search,
  'google-business': MapPin,
  'social-setup': Share2,
  'social-management': MessageSquare,
  ads: Target,
  email: Mail,
  'lead-forms': FileText,
  maintenance: Settings,
  'landing-pages': Rocket,
};

type PersonalErrors = Record<
  keyof Pick<
    ContactFormState,
    'fullName' | 'businessName' | 'email' | 'phone' | 'country' | 'preferredLanguage'
  >,
  string
>;

const emptyPersonalErrors = (): PersonalErrors => ({
  fullName: '',
  businessName: '',
  email: '',
  phone: '',
  country: '',
  preferredLanguage: '',
});

type StepKind = 'personal' | 'services' | 'shared' | 'service';

export default function ContactForm() {
  const t = useTranslations('contact.form');
  const locale = useLocale();
  const formTopRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serviceError, setServiceError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [legalConsentAccepted, setLegalConsentAccepted] = useState(false);
  const [consentError, setConsentError] = useState('');

  const [formData, setFormData] = useState<ContactFormState>({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    country: '',
    preferredLanguage: '',
    selectedServices: [],
    sharedAnswers: {},
    serviceAnswers: {},
    additionalNotes: '',
  });

  const [errors, setErrors] = useState<PersonalErrors>(emptyPersonalErrors());

  const showShared = hasSharedStep(formData.selectedServices);
  const activeSharedFields = useMemo(
    () => getActiveSharedFields(formData.selectedServices),
    [formData.selectedServices]
  );

  /** Build ordered step kinds for the current selection. */
  const stepPlan: StepKind[] = useMemo(() => {
    const plan: StepKind[] = ['personal', 'services'];
    if (showShared) plan.push('shared');
    formData.selectedServices.forEach(() => plan.push('service'));
    return plan;
  }, [showShared, formData.selectedServices]);

  const totalSteps = stepPlan.length;
  const currentKind = stepPlan[currentStep - 1] ?? 'personal';

  const serviceIndex =
    currentKind === 'service'
      ? currentStep - 1 - (showShared ? 3 : 2)
      : -1;
  const currentService: ServiceId | null =
    serviceIndex >= 0 ? formData.selectedServices[serviceIndex] ?? null : null;

  const isLastStep = currentStep === totalSteps && formData.selectedServices.length > 0;

  const scrollToForm = () => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const focusFirstInvalid = (fieldNames: string[]) => {
    for (const name of fieldNames) {
      const el = document.querySelector(
        `[name="${name}"], [name="shared_${name}"], [data-field="${name}"] input, [data-field="${name}"] textarea`
      ) as HTMLElement | null;
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  };

  const validateField = (field: keyof PersonalErrors, value: string) => {
    let error = '';
    if (field === 'email') {
      if (!value.trim()) error = t('validation.required');
      else if (!isEmailValid(value)) error = t('validation.emailInvalid');
    } else if (field === 'phone') {
      if (!value.trim()) error = t('validation.required');
      else if (!isPhoneValid(value)) error = t('validation.phoneInvalid');
    } else if (!value.trim()) {
      error = t('validation.required');
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateStep1 = (): boolean => {
    const next = emptyPersonalErrors();
    let valid = true;

    (['fullName', 'businessName', 'country', 'preferredLanguage'] as const).forEach((k) => {
      if (!formData[k].trim()) {
        next[k] = t('validation.required');
        valid = false;
      }
    });
    if (!formData.email.trim()) {
      next.email = t('validation.required');
      valid = false;
    } else if (!isEmailValid(formData.email)) {
      next.email = t('validation.emailInvalid');
      valid = false;
    }
    if (!formData.phone.trim()) {
      next.phone = t('validation.required');
      valid = false;
    } else if (!isPhoneValid(formData.phone)) {
      next.phone = t('validation.phoneInvalid');
      valid = false;
    }

    setErrors(next);
    if (!valid) {
      const order: (keyof PersonalErrors)[] = [
        'businessName',
        'fullName',
        'email',
        'phone',
        'country',
        'preferredLanguage',
      ];
      const first = order.find((k) => next[k]);
      if (first) focusFirstInvalid([first]);
      scrollToForm();
    }
    return valid;
  };

  const validateServices = (): boolean => {
    if (formData.selectedServices.length === 0) {
      setServiceError(t('validation.selectService'));
      scrollToForm();
      return false;
    }
    setServiceError('');
    return true;
  };

  const validateShared = (): boolean => {
    const next: Record<string, string> = {};
    const firstInvalid: string[] = [];
    for (const def of activeSharedFields) {
      const value = formData.sharedAnswers[def.field.id];
      if (def.field.required && isEmptyAnswer(value)) {
        next[def.field.id] = t('validation.required');
        firstInvalid.push(def.field.id);
      } else if (
        def.field.type === 'url' &&
        typeof value === 'string' &&
        value.trim() &&
        !isUrlValid(value)
      ) {
        next[def.field.id] = t('validation.urlInvalid');
        firstInvalid.push(def.field.id);
      }
    }
    setFieldErrors(next);
    if (firstInvalid.length) {
      focusFirstInvalid(firstInvalid);
      scrollToForm();
      return false;
    }
    return true;
  };

  const validateCurrentService = (): boolean => {
    if (!currentService) return true;
    const config = getResolvedQuestionnaire(
      currentService,
      formData.selectedServices
    );
    if (!config) return true;

    const answers = formData.serviceAnswers[currentService] || {};
    const nextErrors: Record<string, string> = {};
    const firstInvalid: string[] = [];

    for (const section of config.sections) {
      for (const field of section.fields) {
        const otherVal = field.otherFieldId ? answers[field.otherFieldId] : undefined;
        if (!validateRequiredField(field, answers[field.id], otherVal)) {
          if (isEmptyAnswer(answers[field.id])) {
            nextErrors[field.id] = t('validation.required');
            firstInvalid.push(field.id);
          }
          if (field.otherFieldId && isOtherSelected(field, answers[field.id])) {
            if (isEmptyAnswer(otherVal)) {
              nextErrors[field.otherFieldId] = t('validation.required');
              firstInvalid.push(field.otherFieldId);
            }
          }
        } else if (
          field.type === 'url' &&
          typeof answers[field.id] === 'string' &&
          (answers[field.id] as string).trim() &&
          !isUrlValid(answers[field.id] as string)
        ) {
          nextErrors[field.id] = t('validation.urlInvalid');
          firstInvalid.push(field.id);
        }
      }
    }

    setFieldErrors(nextErrors);
    if (firstInvalid.length) {
      focusFirstInvalid(firstInvalid);
      scrollToForm();
      return false;
    }
    return true;
  };

  const updateField = <K extends keyof ContactFormState>(
    field: K,
    value: ContactFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in emptyPersonalErrors() && typeof value === 'string') {
      validateField(field as keyof PersonalErrors, value);
    }
  };

  const toggleService = (service: ServiceId) => {
    setServiceError('');
    setFormData((prev) => {
      const isSelected = prev.selectedServices.includes(service);
      if (isSelected) {
        const selectedServices = prev.selectedServices.filter((s) => s !== service);
        const serviceAnswers = { ...prev.serviceAnswers };
        delete serviceAnswers[service];
        // Prune shared answers no longer needed
        const stillShared = getActiveSharedFields(selectedServices).map((f) => f.id);
        const sharedAnswers = { ...prev.sharedAnswers };
        Object.keys(sharedAnswers).forEach((key) => {
          if (!stillShared.includes(key as never)) delete sharedAnswers[key];
        });
        return { ...prev, selectedServices, serviceAnswers, sharedAnswers };
      }
      return {
        ...prev,
        selectedServices: [...prev.selectedServices, service],
      };
    });
  };

  const updateSharedAnswer = (fieldId: string, answer: AnswerValue) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
    setFormData((prev) => ({
      ...prev,
      sharedAnswers: { ...prev.sharedAnswers, [fieldId]: answer },
    }));
  };

  const updateServiceAnswer = (questionId: string, answer: AnswerValue) => {
    if (!currentService) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setFormData((prev) => ({
      ...prev,
      serviceAnswers: {
        ...prev.serviceAnswers,
        [currentService]: {
          ...(prev.serviceAnswers[currentService] || {}),
          [questionId]: answer,
        },
      },
    }));
  };

  const handleSharedFileUpload = (fieldId: string, files: FileList | null) => {
    if (!files) return;
    const current = (formData.sharedAnswers[fieldId] as File[]) || [];
    updateSharedAnswer(fieldId, [...current, ...Array.from(files)]);
  };

  const removeSharedFile = (fieldId: string, index: number) => {
    const current = (formData.sharedAnswers[fieldId] as File[]) || [];
    updateSharedAnswer(
      fieldId,
      current.filter((_, i) => i !== index)
    );
  };

  const handleServiceFileUpload = (questionId: string, files: FileList | null) => {
    if (!currentService || !files) return;
    const current =
      (formData.serviceAnswers[currentService]?.[questionId] as File[]) || [];
    updateServiceAnswer(questionId, [...current, ...Array.from(files)]);
  };

  const removeServiceFile = (questionId: string, index: number) => {
    if (!currentService) return;
    const current =
      (formData.serviceAnswers[currentService]?.[questionId] as File[]) || [];
    updateServiceAnswer(
      questionId,
      current.filter((_, i) => i !== index)
    );
  };

  const nextStep = () => {
    if (currentKind === 'personal' && !validateStep1()) return;
    if (currentKind === 'services' && !validateServices()) return;
    if (currentKind === 'shared' && !validateShared()) return;
    if (currentKind === 'service' && !validateCurrentService()) return;
    if (currentStep < totalSteps) {
      setFieldErrors({});
      setCurrentStep((s) => s + 1);
      scrollToForm();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setFieldErrors({});
      setCurrentStep((s) => s - 1);
      scrollToForm();
    }
  };

  const appendAnswer = (
    payload: FormData,
    prefix: string,
    questionId: string,
    answer: AnswerValue
  ) => {
    if (Array.isArray(answer) && answer.length > 0 && answer[0] instanceof File) {
      (answer as File[]).forEach((file, index) => {
        payload.append(`${prefix}_${questionId}_${index}`, file);
      });
    } else if (Array.isArray(answer)) {
      payload.append(`${prefix}_${questionId}`, JSON.stringify(answer));
    } else {
      payload.append(`${prefix}_${questionId}`, answer as string);
    }
  };

  /** Inject shared answers into each consuming service for a complete email payload. */
  const buildEnrichedServiceAnswers = () => {
    const enriched: Record<string, Record<string, AnswerValue>> = {};

    formData.selectedServices.forEach((serviceId) => {
      enriched[serviceId] = { ...(formData.serviceAnswers[serviceId] || {}) };
      const mapping = SERVICE_FIELD_TO_SHARED[serviceId] || {};
      Object.entries(mapping).forEach(([localId, sharedId]) => {
        if (!sharedId) return;
        const sharedVal = formData.sharedAnswers[sharedId];
        if (sharedVal !== undefined && isEmptyAnswer(enriched[serviceId][localId])) {
          enriched[serviceId][localId] = sharedVal;
        }
      });
    });

    return enriched;
  };

  const handleSubmit = async () => {
    if (currentKind === 'shared' && !validateShared()) return;
    if (currentKind === 'service' && !validateCurrentService()) return;

    if (!legalConsentAccepted) {
      setConsentError(t('validation.consentRequired'));
      const el = document.getElementById('legal-consent');
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setConsentError('');

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('businessName', formData.businessName);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('country', formData.country);
      payload.append('preferredLanguage', formData.preferredLanguage);
      payload.append('selectedServices', JSON.stringify(formData.selectedServices));
      payload.append('additionalNotes', formData.additionalNotes);
      payload.append('legalConsentAccepted', 'true');
      payload.append('legalPolicyVersion', LEGAL_POLICY_VERSION);
      payload.append('legalTermsVersion', LEGAL_TERMS_VERSION);

      // Shared answers (also listed once in email)
      Object.entries(formData.sharedAnswers).forEach(([questionId, answer]) => {
        appendAnswer(payload, 'shared', questionId, answer);
      });

      const enriched = buildEnrichedServiceAnswers();
      Object.entries(enriched).forEach(([service, answers]) => {
        Object.entries(answers).forEach(([questionId, answer]) => {
          appendAnswer(payload, service, questionId, answer);
        });
      });

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: payload,
      });

      let result: { success?: boolean; error?: string } = {};
      try {
        result = await response.json();
      } catch {
        result = { error: `HTTP ${response.status}` };
      }

      if (response.ok && result.success) {
        setIsSuccess(true);
        scrollToForm();
      } else {
        const msg = result.error || t('error');
        if (process.env.NODE_ENV === 'development') {
          alert(`${t('errorPrefix')}: ${msg}`);
        } else {
          alert(t('error'));
        }
      }
    } catch (err) {
      console.error('[ContactForm] submit error:', err);
      alert(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-white p-6 text-center shadow-xl sm:p-12"
      >
        <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-500 sm:mb-6 sm:h-20 sm:w-20" />
        <h3 className="heading-section mb-3 text-gray-900 sm:mb-4">{t('success.title')}</h3>
        <p className="text-lead text-gray-600">{t('success.message')}</p>
      </motion.div>
    );
  }

  const personalField = (
    name: keyof PersonalErrors,
    label: string,
    type: string,
    extra?: { placeholder?: string }
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
      {type === 'select' ? (
        <select
          name={name}
          value={formData[name]}
          onChange={(e) => updateField(name, e.target.value)}
          onBlur={(e) => validateField(name, e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">{t('steps.1.selectLanguage')}</option>
          {PREFERRED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {t(`languages.${lang}`)}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          placeholder={extra?.placeholder}
          onChange={(e) => updateField(name, e.target.value)}
          onBlur={(e) => validateField(name, e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      )}
      {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <div
      ref={formTopRef}
      className="surface-card overflow-hidden shadow-premium border-slate-200/80"
    >
      <div className="border-b border-slate-200/70 bg-slate-50/90 p-4 sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          {Array.from({ length: Math.max(totalSteps, 2) }).map((_, index) => (
            <div
              key={index}
              className={`mx-0.5 h-2 flex-1 rounded-full transition-colors sm:mx-1 ${
                index + 1 <= currentStep ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-600">
          {t('step')} {currentStep} {t('of')} {totalSteps}
        </p>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentKind === 'personal' && (
              <div className="space-y-6">
                <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">{t('steps.1.title')}</h2>
                <p className="mb-6 text-sm text-gray-600 sm:text-base">{t('steps.1.subtitle')}</p>
                {personalField('businessName', t('steps.1.businessName'), 'text')}
                {personalField('fullName', t('steps.1.fullName'), 'text')}
                {personalField('email', t('steps.1.email'), 'email')}
                {personalField('phone', t('steps.1.phone'), 'tel', {
                  placeholder: '+383 45 949 507',
                })}
                {personalField('country', t('steps.1.country'), 'text')}
                {personalField('preferredLanguage', t('steps.1.preferredLanguage'), 'select')}
              </div>
            )}

            {currentKind === 'services' && (
              <div>
                <h2 className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl">{t('steps.2.title')}</h2>
                <p className="mb-5 text-sm text-gray-600 sm:mb-6 sm:text-base">{t('steps.2.subtitle')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SERVICE_IDS.map((service) => {
                    const Icon = serviceIcons[service];
                    const isSelected = formData.selectedServices.includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleService(service)}
                        className={`p-4 border-2 rounded-xl transition-all text-left ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="mt-1 w-5 h-5 text-primary-500 rounded focus:ring-primary-500 pointer-events-none"
                          />
                          <div className="flex-1">
                            <Icon className="w-8 h-8 mb-2 text-primary-500" />
                            <p className="text-sm font-medium">{t(`services.${service}`)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {serviceError && (
                  <p className="mt-4 text-sm text-red-600">{serviceError}</p>
                )}
              </div>
            )}

            {currentKind === 'shared' && (
              <SharedFieldsStep
                fields={activeSharedFields}
                answers={formData.sharedAnswers}
                errors={fieldErrors}
                onChange={updateSharedAnswer}
                onFileUpload={handleSharedFileUpload}
                onRemoveFile={removeSharedFile}
              />
            )}

            {currentKind === 'service' && currentService && (
              <ServiceQuestionnaire
                serviceId={currentService}
                selectedServices={formData.selectedServices}
                answers={formData.serviceAnswers[currentService] || {}}
                errors={fieldErrors}
                onChange={updateServiceAnswer}
                onFileUpload={handleServiceFileUpload}
                onRemoveFile={removeServiceFile}
                collapsible={formData.selectedServices.length > 1}
                defaultOpen
              />
            )}

            {isLastStep && (
              <>
                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('additionalNotes')}
                  </label>
                  <textarea
                    name="additionalNotes"
                    rows={4}
                    value={formData.additionalNotes}
                    onChange={(e) => updateField('additionalNotes', e.target.value)}
                    placeholder={t('additionalNotesPlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <PrivacyNotice />
                <div className="mt-6">
                  <label
                    htmlFor="legal-consent"
                    className={`flex items-start gap-3 cursor-pointer rounded-lg border p-4 transition-colors ${
                      consentError
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-gray-50 hover:border-primary-300'
                    }`}
                  >
                    <input
                      id="legal-consent"
                      name="legalConsent"
                      type="checkbox"
                      checked={legalConsentAccepted}
                      onChange={(e) => {
                        setLegalConsentAccepted(e.target.checked);
                        if (e.target.checked) setConsentError('');
                      }}
                      className="mt-1 w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(consentError)}
                      aria-describedby={consentError ? 'legal-consent-error' : undefined}
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {t.rich('consent.text', {
                        privacy: (chunks) => (
                          <Link
                            href={`/${locale}/privacy-policy`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {chunks}
                          </Link>
                        ),
                        terms: (chunks) => (
                          <Link
                            href={`/${locale}/terms-and-conditions`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {chunks}
                          </Link>
                        ),
                      })}
                    </span>
                  </label>
                  {consentError ? (
                    <p id="legal-consent-error" className="mt-2 text-sm text-red-600">
                      {consentError}
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:mt-8 sm:flex-row sm:justify-between sm:gap-0 sm:pt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex min-h-11 w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 px-6 py-3 transition-colors hover:bg-gray-50 sm:w-auto"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('back')}</span>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {!isLastStep ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex min-h-11 w-full items-center justify-center space-x-2 rounded-lg bg-primary-500 px-6 py-3 text-white transition-colors hover:bg-primary-600 sm:ml-auto sm:w-auto"
            >
              <span>{t('next')}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex min-h-11 w-full items-center justify-center space-x-2 rounded-lg bg-primary-500 px-6 py-3 text-white transition-colors hover:bg-primary-600 disabled:opacity-50 sm:ml-auto sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>{t('submitting')}</span>
                </>
              ) : (
                <span>{t('submit')}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
