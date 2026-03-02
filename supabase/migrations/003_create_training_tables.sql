-- Training events (calendar)
create table public.training_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_date date not null,
  start_time time,
  end_time time,
  event_type text not null default 'webinar'
    check (event_type in ('webinar', 'in-person', 'workshop', 'deadline')),
  url text,
  fee decimal(10,2) default 0,
  venmo_qr_url text,
  status text not null default 'published'
    check (status in ('draft', 'published', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Training videos
create table public.training_videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text not null,
  description text,
  sort_order integer not null default 0,
  status text not null default 'published'
    check (status in ('draft', 'published')),
  created_at timestamptz default now()
);

-- RLS
alter table public.training_events enable row level security;
alter table public.training_videos enable row level security;

create policy "Allow all for training_events (dev)" on public.training_events
  for all using (true) with check (true);

create policy "Allow all for training_videos (dev)" on public.training_videos
  for all using (true) with check (true);

-- Seed existing training videos
insert into public.training_videos (title, url, sort_order) values
  ('Getting Started',                'https://youtu.be/afyOXaXMU2k',  1),
  ('Deep Learning',                  'https://youtu.be/wFcaGDzW9_Y',  2),
  ('The Process',                    'https://youtu.be/k32_uqy3A5Y',  3),
  ('Learning the Flow',              'https://youtu.be/1iF8XRJpark',  4),
  ('Getting Started w/ OSA',         'https://youtu.be/nPARGmUkKKw',  5),
  ('Integrating - Inspection Tools', 'https://youtu.be/vPGe9ZIDON0',  6),
  ('Full Cycle',                     'https://youtu.be/O3z4oQhDLt4',  7),
  ('Cycling Through a Claim',        'https://youtu.be/yqYmlZ1Zers',  8),
  ('Simple Start',                   'https://youtu.be/ToAPldXdc64',  9),
  ('Finishing the Claim',            'https://youtu.be/ndor2yDy7dA', 10),
  ('The Foundation',                 'https://youtu.be/XBJcSLWWoA8', 11),
  ('Closing the Claim',              'https://youtu.be/50ZVJDzkC2w', 12);
