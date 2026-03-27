-- Module videos: YouTube URLs for the 7 feature module cards on the Mobile App page
CREATE TABLE module_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text UNIQUE NOT NULL,
  title text NOT NULL,
  video_url text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE module_videos ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public can read module videos" ON module_videos
  FOR SELECT USING (true);

-- Seed the 7 fixed module rows
INSERT INTO module_videos (module_key, title) VALUES
  ('claim-dashboard', 'Claim Dashboard'),
  ('map-schedule', 'Map & Schedule'),
  ('photos', 'Photos'),
  ('inspection', 'Inspection'),
  ('line-items', 'Line Items'),
  ('contents', 'Contents'),
  ('forms', 'Forms');
