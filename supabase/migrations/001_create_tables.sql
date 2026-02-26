-- Posts table for blog
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  excerpt text,
  author text not null default 'Todd Isenburg',
  category text not null default 'General',
  status text not null default 'published',
  read_time text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Attaboys table
create table public.attaboys (
  id uuid default gen_random_uuid() primary key,
  recipient text not null,
  author text not null,
  message text not null,
  category text not null default 'Team Player',
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  created_at timestamptz default now()
);

-- Enable RLS (wide open for dev — swap to role-gated for production)
alter table public.posts enable row level security;
alter table public.attaboys enable row level security;

-- Dev policies: allow all operations for anon and authenticated
create policy "Allow all for posts (dev)" on public.posts
  for all using (true) with check (true);

create policy "Allow all for attaboys (dev)" on public.attaboys
  for all using (true) with check (true);

/*
  PRODUCTION POLICIES (swap in when auth is added):

  -- Read: anyone can read published posts
  create policy "Public can read published posts" on public.posts
    for select using (status = 'published');

  -- Write: only authenticated admins
  create policy "Admins can manage posts" on public.posts
    for all using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

  create policy "Public can read attaboys" on public.attaboys
    for select using (true);

  create policy "Admins can manage attaboys" on public.attaboys
    for all using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');
*/

-- Seed data: sample blog posts
insert into public.posts (title, content, excerpt, author, category, read_time) values
(
  'Welcome to One Stop Adjuster',
  'We''re excited to launch the One Stop Adjuster blog! Here we''ll share industry insights, tips for field adjusters, and updates about our platform. Whether you''re a seasoned veteran or just starting your career in flood adjusting, this blog is your resource for staying ahead in the industry.

Our mission has always been simple: streamline the claims process so adjusters can focus on what matters — helping policyholders recover. Stay tuned for weekly articles covering everything from Xactimate best practices to field inspection techniques.',
  'Introducing the OSA blog — your resource for flood adjusting insights and platform updates.',
  'Todd Isenburg',
  'Announcements',
  '2 min read'
),
(
  'Top 5 Field Inspection Tips for New Adjusters',
  'Starting out as a flood adjuster can feel overwhelming. Between documenting damage, navigating insurance protocols, and managing policyholder expectations, there''s a lot to juggle. Here are five tips that every new adjuster should know:

1. **Document Everything** — Take more photos than you think you need. One Stop Adjuster''s voice-recorded notes make this effortless.

2. **Follow the Water** — Always trace the water path from entry point to the lowest affected area. This tells the complete story of the loss.

3. **Use Technology** — Tools like OSA eliminate manual data entry and reduce errors. Real-time categorization saves hours per claim.

4. **Communicate Clearly** — Keep the policyholder informed at every step. Transparency builds trust and reduces callbacks.

5. **Know Your Codes** — Building codes vary by jurisdiction. Always verify local requirements before writing your estimate.',
  'Five essential tips every new flood adjuster should know to succeed in the field.',
  'Todd Isenburg',
  'Tips & Tricks',
  '4 min read'
),
(
  'How OSA Integrates with Xactimate',
  'One of the most frequently asked questions we get is: "How does One Stop Adjuster work with Xactimate?" The answer is simple — seamlessly.

OSA captures all your field data — photos, measurements, notes, sketches — and structures it in a format that maps directly to Xactimate line items. No more re-entering data. No more switching between apps. No more lost photos.

When you finish an inspection with OSA, your data is already organized by room and damage type. Export it, and Xactimate picks it up like you typed it all in manually — except it took you a fraction of the time.

This integration is what sets OSA apart. We''re not replacing Xactimate — we''re making it better by feeding it clean, complete data from the field.',
  'Learn how One Stop Adjuster feeds structured field data directly into Xactimate.',
  'Todd Isenburg',
  'Product',
  '3 min read'
);

-- Seed data: sample attaboys
insert into public.attaboys (recipient, author, message, category, rating) values
('Vic Miller', 'Todd Isenburg', 'Outstanding work on the Hurricane Helene deployment. Vic processed 47 claims in 3 weeks with zero callbacks. His attention to detail and use of the OSA app set the standard for the entire team.', 'Top Performer', 5),
('Michelle Brown', 'Regional Manager', 'Michelle went above and beyond helping a policyholder who was struggling after losing their home. She stayed late to ensure the advance payment was processed same-day. That''s what being an adjuster is about.', 'Above & Beyond', 5),
('David Chen', 'Todd Isenburg', 'David mentored three new adjusters during his last deployment, walking them through the OSA workflow step by step. Every one of them hit the ground running thanks to his patience and expertise.', 'Team Player', 4),
('Sarah Thompson', 'Field Supervisor', 'Sarah identified a structural issue that previous inspectors had missed, potentially saving the carrier from a costly re-inspection. Her thoroughness is a model for the team.', 'Sharp Eye', 5),
('Carlos Rodriguez', 'Todd Isenburg', 'Carlos consistently delivers the most complete documentation packages on the team. His reports are so thorough that desk adjusters rarely have follow-up questions. True professional.', 'Top Performer', 5);
