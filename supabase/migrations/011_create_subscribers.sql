-- Newsletter subscribers
CREATE TABLE subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Public can insert (subscribe)
CREATE POLICY "Public can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Public can read (for duplicate check)
CREATE POLICY "Public can read subscribers" ON subscribers
  FOR SELECT USING (true);
