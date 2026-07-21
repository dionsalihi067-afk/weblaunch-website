import type { LegalBlock, LegalDocument, LegalSection } from '@/lib/legal/types';

function BlockContent({ block }: { block: LegalBlock }) {
  return (
    <>
      {block.title ? (
        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
          {block.title}
        </h3>
      ) : null}
      {block.intro ? (
        <p className="text-gray-600 mb-4">{block.intro}</p>
      ) : null}
      {block.paragraphs?.map((paragraph, index) => (
        <p key={`p-${index}`} className="text-gray-600 mb-4">
          {paragraph}
        </p>
      ))}
      {block.items ? (
        <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
          {block.items.map((item, index) => (
            <li key={`i-${index}`}>{item}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function Section({ section }: { section: LegalSection }) {
  return (
    <div className="mb-2">
      <h2 className="mt-6 mb-3 text-xl font-bold text-gray-900 sm:mt-8 sm:mb-4 sm:text-2xl">
        {section.title}
      </h2>
      {section.intro ? (
        <p className="text-gray-600 mb-4">{section.intro}</p>
      ) : null}
      {section.paragraphs?.map((paragraph, index) => (
        <p key={`sp-${index}`} className="text-gray-600 mb-4">
          {paragraph}
        </p>
      ))}
      {section.items ? (
        <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-1">
          {section.items.map((item, index) => (
            <li key={`si-${index}`}>{item}</li>
          ))}
        </ul>
      ) : null}
      {section.subsections?.map((subsection, index) => (
        <BlockContent
          key={subsection.title ?? `sub-${index}`}
          block={subsection}
        />
      ))}
    </div>
  );
}

export default function LegalDocumentView({
  document,
}: {
  document: LegalDocument;
}) {
  const { contact } = document;

  return (
    <div className="prose prose-base sm:prose-lg max-w-none overflow-x-clip break-words">
      <p className="mb-2 text-gray-600">{document.updated}</p>
      <p className="mb-6 text-gray-600 sm:mb-8">{document.effectiveDate}</p>

      {document.sections.map((section) => (
        <Section key={section.title} section={section} />
      ))}

      <div className="mt-8 rounded-xl bg-gray-50 p-4 not-prose sm:mt-10 sm:rounded-lg sm:p-6">
        <p className="leading-relaxed text-gray-700">
          <strong>{contact.company}</strong>
          <br />
          {contact.address}
          <br />
          Email:{' '}
          <a
            href={`mailto:${contact.email}`}
            className="break-all text-primary-600 hover:underline"
          >
            {contact.email}
          </a>
          <br />
          Phone:{' '}
          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="text-primary-600 hover:underline"
          >
            {contact.phone}
          </a>
          {contact.instagram ? (
            <>
              <br />
              Instagram: {contact.instagram}
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
