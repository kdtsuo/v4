import { Session, User } from '@supabase/supabase-js';
import { LucideIcon } from 'lucide-react';
import { ExternalToast, toast as sonnerToast } from 'sonner';

export type ActionType = 'update' | 'add' | 'delete' | 'reorder' | null;

export type Link = {
  id?: number; // Supabase will provide this
  iconType: string;
  label: string;
  link: string;
  date: string;
  price?: number;
  order?: number; // For reordering links
};

export type IconLinkWideProps = {
  iconType?: string;
  label: string;
  link: string;
  className?: string;
  date?: string;
  onDelete?: () => void;
  deleteMode?: boolean;
  price?: number;
  style?: React.CSSProperties;
};

export type Position = {
  id?: string;
  label: string;
  form_url: string;
  is_accepting_responses: boolean;
  description?: string;
  created_at?: string;
};

export interface SocialLink {
  icon: string;
  href: string;
  title: string;
}

export interface SponsorData {
  id?: string;
  image: string;
  title: string;
  location: string;
  maplink: string;
  text: string;
  websitelink: string;
  created_at: string | undefined;
}

export interface SponsorProps {
  id?: string;
  image: string;
  title: string;
  location: string;
  maplink: string;
  text: string;
  websitelink: string;
  isAdmin?: boolean;
  created_at?: string;
  onSponsorDeleted?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteMode?: boolean;
}

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
};

export interface ToastContextType {
  toast: {
    success: (message: string, data?: ExternalToast) => void;
    error: (message: string, data?: ExternalToast) => void;
    info: (message: string, data?: ExternalToast) => void;
    warning: (message: string, data?: ExternalToast) => void;
    promise: typeof sonnerToast.promise;
    custom: typeof sonnerToast.custom;
    message: typeof sonnerToast.message;
    loading: typeof sonnerToast.loading;
    dismiss: typeof sonnerToast.dismiss;
  };
}

export interface IconMapItem {
  iconComponent?: LucideIcon;
  imagePath?: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  bio: string;
  profile_image_url: string;
  instagram_url: string;
  linkedin_url: string;
  github_url: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
}
