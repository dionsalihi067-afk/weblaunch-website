import {
  Code,
  Palette,
  TrendingUp,
  MapPin,
  Share2,
  Users,
  Megaphone,
  Mail,
  FileText,
  Settings,
  Layout,
  Check,
  Star,
  Zap,
  Target,
  Award,
  Shield,
  Rocket,
  Heart,
  Clock,
  Globe,
  type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  Code,
  Palette,
  TrendingUp,
  MapPin,
  Share2,
  Users,
  Megaphone,
  Mail,
  FileText,
  Settings,
  Layout,
  Check,
  Star,
  Zap,
  Target,
  Award,
  Shield,
  Rocket,
  Heart,
  Clock,
  Globe,
};

export function getServiceIcon(iconName: string): LucideIcon {
  return icons[iconName] || Code;
}

export function getBenefitIcon(iconName: string): LucideIcon {
  return getServiceIcon(iconName);
}
