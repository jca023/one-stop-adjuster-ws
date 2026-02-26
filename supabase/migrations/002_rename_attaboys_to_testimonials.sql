-- Drop the attaboys table and create testimonials with proper schema
drop table if exists attaboys;

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  quote text not null,
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz default now()
);

-- Enable RLS (open for dev, lock down for production)
alter table testimonials enable row level security;
create policy "Allow public read" on testimonials for select using (true);
create policy "Allow all writes (dev)" on testimonials for all using (true);

-- Seed with the 3 existing testimonials
insert into testimonials (name, role, quote, rating, status) values
  ('Vic Miller', 'Senior Adjuster', 'I used the app on every claim and honestly don''t know what I would have done without it. Super easy to navigate and is an adjuster''s best friend in the field. Advance payments were done in a flash and all resources at your fingertips. EVERY adjuster needs this app to be successful.', 5, 'published'),
  ('Michelle Brown', 'Field Adjuster', 'One Stop Adjuster was a game-changer during my deployment. As a first-time user, I found it intuitive, efficient, and easy to use. It seamlessly organized my photos, allowing real-time categorization with accurate voice-recorded notes, eliminating post-inspection sorting. The built-in forms had everything I needed, ensuring smooth, error-free reporting.', 5, 'published'),
  ('David Chen', 'Independent Adjuster', 'Best of all, it structured my data in real-time, making report submission fast and hassle-free. I''ll definitely be using it in the field going forward! The sketching tool alone saved me hours per claim.', 5, 'published');
