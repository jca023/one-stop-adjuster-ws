-- Document categories
CREATE TABLE public.document_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now()
);

-- Documents
CREATE TABLE public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.document_categories(id),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS (dev — open access, will lock down before launch)
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for document_categories (dev)" ON public.document_categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for documents (dev)" ON public.documents
  FOR ALL USING (true) WITH CHECK (true);

-- Seed default category with the 3 existing docs
INSERT INTO public.document_categories (id, name, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Documentation', 1);

INSERT INTO public.documents (category_id, title, description, file_url, file_name, file_size, file_type, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Getting Started Guide', 'Complete walkthrough for new users', 'https://www.one-stop-adjuster.com/s/Getting-Started-Guide-Verisk2.pdf', 'Getting-Started-Guide-Verisk2.pdf', 0, 'pdf', 1),
  ('00000000-0000-0000-0000-000000000001', 'OSA Pocket Guide', 'Quick reference guide for field adjusters', 'https://www.one-stop-adjuster.com/s/OSA-Pocket-Guide-9-25-2025.pdf', 'OSA-Pocket-Guide-9-25-2025.pdf', 0, 'pdf', 2),
  ('00000000-0000-0000-0000-000000000001', 'OSA Process', 'End-to-end claims process documentation', 'https://www.one-stop-adjuster.com/s/OSA-Process.docx', 'OSA-Process.docx', 0, 'docx', 3);
