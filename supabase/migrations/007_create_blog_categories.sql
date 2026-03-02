-- Create blog_categories table (mirrors document_categories / video_categories pattern)
CREATE TABLE public.blog_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS (dev-open policy)
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to blog_categories" ON public.blog_categories
  FOR ALL USING (true) WITH CHECK (true);

-- Seed the 5 existing hardcoded categories
INSERT INTO public.blog_categories (name, sort_order, status) VALUES
  ('General', 1, 'published'),
  ('Announcements', 2, 'published'),
  ('Tips & Tricks', 3, 'published'),
  ('Product', 4, 'published'),
  ('Industry News', 5, 'published');

-- Add category_id FK to posts table
ALTER TABLE public.posts
  ADD COLUMN category_id uuid REFERENCES public.blog_categories(id);

-- Populate category_id on existing posts based on their string category field
UPDATE public.posts p
SET category_id = bc.id
FROM public.blog_categories bc
WHERE p.category = bc.name;
