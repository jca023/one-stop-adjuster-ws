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
  status: string;
  read_time: string | null;
  created_at: string;
  updated_at: string;
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
