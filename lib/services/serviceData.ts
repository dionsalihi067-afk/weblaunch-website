import { ServiceConfig } from './types';

// Service Configuration
export const servicesConfig: Record<string, ServiceConfig> = {
  'website-development': {
    id: 'website-development',
    icon: 'Code',
    color: 'from-primary-500 to-sky-500',
    category: 'development'
  },
  'branding': {
    id: 'branding',
    icon: 'Palette',
    color: 'from-slate-700 to-slate-500',
    category: 'design'
  },
  'seo': {
    id: 'seo',
    icon: 'TrendingUp',
    color: 'from-emerald-500 to-teal-500',
    category: 'marketing'
  },
  'google-business': {
    id: 'google-business',
    icon: 'MapPin',
    color: 'from-orange-500 to-amber-500',
    category: 'marketing'
  },
  'social-setup': {
    id: 'social-setup',
    icon: 'Share2',
    color: 'from-sky-500 to-primary-500',
    category: 'marketing'
  },
  'social-management': {
    id: 'social-management',
    icon: 'Users',
    color: 'from-rose-500 to-orange-400',
    category: 'marketing'
  },
  'ads': {
    id: 'ads',
    icon: 'Megaphone',
    color: 'from-amber-500 to-orange-500',
    category: 'marketing'
  },
  'email': {
    id: 'email',
    icon: 'Mail',
    color: 'from-cyan-500 to-primary-500',
    category: 'support'
  },
  'lead-forms': {
    id: 'lead-forms',
    icon: 'FileText',
    color: 'from-teal-500 to-emerald-500',
    category: 'development'
  },
  'maintenance': {
    id: 'maintenance',
    icon: 'Settings',
    color: 'from-slate-500 to-slate-700',
    category: 'support'
  },
  'landing-pages': {
    id: 'landing-pages',
    icon: 'Layout',
    color: 'from-primary-600 to-sky-400',
    category: 'development'
  }
};

// All service IDs for static generation
export const allServiceIds = Object.keys(servicesConfig);

// Validation helper
export function isValidServiceId(id: string): boolean {
  return id in servicesConfig;
}

// Get service config by ID
export function getServiceConfig(id: string): ServiceConfig | undefined {
  return servicesConfig[id];
}
