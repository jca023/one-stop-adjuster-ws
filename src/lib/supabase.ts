import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  author: string;
  category: string;
  category_id: string | null;
  status: string;
  read_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  status: string;
  created_at: string;
}

export interface TrainingEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: 'webinar' | 'in-person' | 'workshop' | 'deadline';
  url: string | null;
  fee: number;
  venmo_qr_url: string | null;
  recording_url: string | null;
  status: 'draft' | 'published' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TrainingVideo {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category_id: string;
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
}

export interface Document {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  submission_type: 'contact' | 'demo';
  message: string | null;
  demo_type: string | null;
  attendees: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: 'new' | 'read' | 'responded' | 'archived';
  created_at: string;
  updated_at: string;
}
