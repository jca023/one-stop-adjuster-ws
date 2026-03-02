-- Video categories (mirrors document_categories)
CREATE TABLE public.video_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now()
);

-- Add category_id to training_videos
ALTER TABLE public.training_videos
  ADD COLUMN category_id uuid REFERENCES public.video_categories(id);

-- RLS (dev — open access, will lock down before launch)
ALTER TABLE public.video_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for video_categories (dev)" ON public.video_categories
  FOR ALL USING (true) WITH CHECK (true);

-- Seed 3 categories
INSERT INTO public.video_categories (id, name, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Getting Started', 1),
  ('10000000-0000-0000-0000-000000000002', 'Claims Process', 2),
  ('10000000-0000-0000-0000-000000000003', 'Advanced Topics', 3);

-- Assign existing videos to categories by title
-- Getting Started category
UPDATE public.training_videos SET category_id = '10000000-0000-0000-0000-000000000001'
  WHERE title IN ('Getting Started', 'Getting Started w/ OSA', 'Simple Start', 'The Foundation');

-- Claims Process category
UPDATE public.training_videos SET category_id = '10000000-0000-0000-0000-000000000002'
  WHERE title IN ('The Process', 'Learning the Flow', 'Full Cycle', 'Cycling Through a Claim', 'Finishing the Claim', 'Closing the Claim');

-- Advanced Topics category
UPDATE public.training_videos SET category_id = '10000000-0000-0000-0000-000000000003'
  WHERE title IN ('Deep Learning', 'Integrating - Inspection Tools');

-- Any remaining videos without a category get assigned to "Getting Started"
UPDATE public.training_videos SET category_id = '10000000-0000-0000-0000-000000000001'
  WHERE category_id IS NULL;

-- Now make category_id NOT NULL
ALTER TABLE public.training_videos ALTER COLUMN category_id SET NOT NULL;
