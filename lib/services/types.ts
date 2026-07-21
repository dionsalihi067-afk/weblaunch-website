// Service System Types

export interface ServicePackage {
  name: string;
  tagline: string;
  popular?: boolean;
  features: string[];
  ideal: string;
}

export interface ServicePackages {
  basic: ServicePackage;
  professional: ServicePackage;
  premium: ServicePackage;
  custom?: ServicePackage;
}

export interface ServiceBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface ServiceIdealClient {
  type: string;
  description: string;
}

export interface ServiceProcessStep {
  title: string;
  description: string;
}

export interface ServiceFeatures {
  [category: string]: string[];
}

export interface ServicePainPoint {
  text: string;
}

export interface ServiceConfig {
  id: string;
  icon: string;
  color: string;
  category: 'development' | 'marketing' | 'design' | 'support';
}

export interface ServiceHeroData {
  title: string;
  subtitle: string;
  cta: string;
}

export interface ServiceProblemData {
  title: string;
  description: string;
  painPoints: string[];
}

export interface ServiceSolutionData {
  title: string;
  description: string;
  differentiators: string[];
}

export interface ServiceCTAData {
  title: string;
  subtitle: string;
  primary: string;
  secondary: string;
}
