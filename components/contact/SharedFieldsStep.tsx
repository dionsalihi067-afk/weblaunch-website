'use client';

import { useTranslations } from 'next-intl';
import { Upload, X, Layers } from 'lucide-react';
import type { AnswerValue } from '@/lib/contact/types';
import type { SharedFieldDef } from '@/lib/contact/sharedFields';
import { isEmptyAnswer } from '@/lib/contact/validation';

interface SharedFieldsStepProps {
  fields: SharedFieldDef[];
  answers: Record<string, AnswerValue>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: AnswerValue) => void;
  onFileUpload: (fieldId: string, files: FileList | null) => void;
  onRemoveFile: (fieldId: string, index: number) => void;
}

export default function SharedFieldsStep({
  fields,
  answers,
  errors,
  onChange,
  onFileUpload,
  onRemoveFile,
}: SharedFieldsStepProps) {
  const t = useTranslations('contact.form.shared');
  const tCommon = useTranslations('contact.form.questionnaire.common');

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        </div>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      <div className="space-y-5">
        {fields.map(({ field }) => {
          const value = answers[field.id];
          const error = errors[field.id];
          const inputClass = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`;

          return (
            <div key={field.id} className="space-y-2" data-field={field.id}>
              <label className="block text-sm font-medium text-gray-700">
                {t(field.labelKey)}
                {field.required ? ' *' : ''}
              </label>

              {field.type === 'textarea' && (
                <textarea
                  name={`shared_${field.id}`}
                  rows={4}
                  value={(value as string) || ''}
                  placeholder={
                    field.placeholderKey ? t(field.placeholderKey) : undefined
                  }
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className={inputClass}
                />
              )}

              {(field.type === 'text' || field.type === 'url') && (
                <input
                  type={field.type}
                  name={`shared_${field.id}`}
                  value={(value as string) || ''}
                  placeholder={
                    field.placeholderKey ? t(field.placeholderKey) : undefined
                  }
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className={inputClass}
                />
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

              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              {!error && field.required && isEmptyAnswer(value) === false ? null : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
