'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, ChevronDown } from 'lucide-react';
import type { AnswerValue, QuestionField, ServiceId } from '@/lib/contact/types';
import { getResolvedQuestionnaire } from '@/lib/contact/questionnaireConfig';
import { isOtherSelected } from '@/lib/contact/validation';

interface ServiceQuestionnaireProps {
  serviceId: ServiceId;
  selectedServices: ServiceId[];
  answers: Record<string, AnswerValue>;
  errors: Record<string, string>;
  onChange: (questionId: string, value: AnswerValue) => void;
  onFileUpload: (questionId: string, files: FileList | null) => void;
  onRemoveFile: (questionId: string, index: number) => void;
  /** When true, wrap content in a collapsible panel (multi-service flow). */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export default function ServiceQuestionnaire({
  serviceId,
  selectedServices,
  answers,
  errors,
  onChange,
  onFileUpload,
  onRemoveFile,
  collapsible = true,
  defaultOpen = true,
}: ServiceQuestionnaireProps) {
  const t = useTranslations('contact.form');
  const tq = useTranslations(`contact.form.questionnaire.${serviceId}`);
  const tCommon = useTranslations('contact.form.questionnaire.common');
  const [open, setOpen] = useState(defaultOpen);
  const config = getResolvedQuestionnaire(serviceId, selectedServices);

  if (!config) return null;

  const resolveOptionLabel = (labelKey: string) => {
    if (labelKey.startsWith('common.')) {
      return tCommon(labelKey.replace('common.', ''));
    }
    return tq(labelKey);
  };

  const renderField = (field: QuestionField) => {
    const value = answers[field.id];
    const error = errors[field.id];
    const showOther = isOtherSelected(field, value);
    const inputClass = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
      error ? 'border-red-500' : 'border-gray-300'
    }`;

    return (
      <div key={field.id} className="space-y-2" data-field={field.id}>
          <label className="block text-sm font-medium text-gray-700">
          {tq(field.labelKey)}
          {field.required ? ' *' : ''}
        </label>

        {field.type === 'textarea' && (
          <textarea
            name={`${serviceId}_${field.id}`}
            rows={4}
            value={(value as string) || ''}
            placeholder={field.placeholderKey ? tq(field.placeholderKey) : undefined}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={inputClass}
          />
        )}

        {(field.type === 'text' ||
          field.type === 'email' ||
          field.type === 'tel' ||
          field.type === 'url' ||
          field.type === 'password') && (
          <input
            type={field.type}
            name={`${serviceId}_${field.id}`}
            value={(value as string) || ''}
            placeholder={field.placeholderKey ? tq(field.placeholderKey) : undefined}
            onChange={(e) => onChange(field.id, e.target.value)}
            autoComplete={field.type === 'password' ? 'new-password' : undefined}
            className={inputClass}
          />
        )}

        {field.type === 'radio' && field.options && (
          <div className="space-y-2">
            {field.options.map((opt) => (
              <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`${serviceId}_${field.id}`}
                  value={opt.value}
                  checked={(value as string) === opt.value}
                  onChange={() => onChange(field.id, opt.value)}
                  className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{resolveOptionLabel(opt.labelKey)}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'checkbox' && field.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {field.options.map((opt) => {
              const selected =
                Array.isArray(value) && (value as string[]).includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => {
                      const current = Array.isArray(value) ? ([...value] as string[]) : [];
                      const next = selected
                        ? current.filter((v) => v !== opt.value)
                        : [...current, opt.value];
                      onChange(field.id, next);
                    }}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{resolveOptionLabel(opt.labelKey)}</span>
                </label>
              );
            })}
          </div>
        )}

        {field.type === 'file' && (
          <div>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="w-7 h-7 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">{tCommon('uploadButton')}</p>
              <input
                type="file"
                className="hidden"
                accept={field.accept}
                multiple={field.multiple !== false}
                onChange={(e) => onFileUpload(field.id, e.target.files)}
              />
            </label>
            {Array.isArray(value) &&
              value.length > 0 &&
              (value as File[])[0] instanceof File && (
                <ul className="mt-3 space-y-2">
                  {(value as File[]).map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm"
                    >
                      <span className="truncate mr-2">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveFile(field.id, index)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={tCommon('removeFile')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        )}

        {field.helperKey && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {tq(field.helperKey)}
          </p>
        )}

        {showOther && field.otherFieldId && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tq(field.otherLabelKey || field.otherFieldId)} *
            </label>
            <input
              type="text"
              name={`${serviceId}_${field.otherFieldId}`}
              value={(answers[field.otherFieldId] as string) || ''}
              onChange={(e) => onChange(field.otherFieldId!, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors[field.otherFieldId] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors[field.otherFieldId] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.otherFieldId]}</p>
            )}
          </div>
        )}

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  const body = (
    <div className="space-y-8">
      {!collapsible && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t(`services.${serviceId}`)}</h2>
          <p className="text-gray-600">{t('questionnaire.subtitle')}</p>
        </div>
      )}

      {config.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          {section.titleKey && (
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              {tq(section.titleKey)}
            </h3>
          )}
          <div className="space-y-5">{section.fields.map(renderField)}</div>
        </div>
      ))}
    </div>
  );

  if (!collapsible) return body;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-lg font-bold text-gray-900">{t(`services.${serviceId}`)}</h2>
          <p className="text-sm text-gray-500">{t('questionnaire.subtitle')}</p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="p-5 border-t border-gray-200">{body}</div>}
    </div>
  );
}
