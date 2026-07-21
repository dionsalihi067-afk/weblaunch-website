export type LegalBlock = {
  title?: string;
  paragraphs?: string[];
  intro?: string;
  items?: string[];
};

export type LegalSection = LegalBlock & {
  subsections?: LegalBlock[];
};

export type LegalDocument = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  updated: string;
  effectiveDate: string;
  contact: {
    company: string;
    address: string;
    email: string;
    phone: string;
    instagram?: string;
  };
  sections: LegalSection[];
};
