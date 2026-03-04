-- Contact form submissions table
CREATE TABLE public.contact_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  submission_type text NOT NULL DEFAULT 'contact'
    CHECK (submission_type IN ('contact', 'demo')),
  message text,
  -- Demo-specific fields (null for regular contact submissions)
  demo_type text,
  attendees text,
  preferred_date text,
  preferred_time text,
  -- Tracking
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'responded', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Dev policy — will be tightened when auth is added
CREATE POLICY "Allow all for contact_submissions (dev)" ON public.contact_submissions
  FOR ALL USING (true) WITH CHECK (true);
