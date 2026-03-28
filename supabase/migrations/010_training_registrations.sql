-- Training registrations: tracks who signed up for which event
CREATE TABLE training_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES training_events(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company text,
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'free', 'refunded')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  amount_paid decimal(10,2) DEFAULT 0,
  registered_at timestamptz DEFAULT now()
);

-- Prevent duplicate registrations for same event
CREATE UNIQUE INDEX idx_registration_event_email ON training_registrations(event_id, email);

-- Enable RLS
ALTER TABLE training_registrations ENABLE ROW LEVEL SECURITY;

-- Public can read registration counts (for capacity display)
CREATE POLICY "Public can read registration counts" ON training_registrations
  FOR SELECT USING (true);

-- Add registration fields to training_events
ALTER TABLE training_events ADD COLUMN registration_deadline timestamptz;
ALTER TABLE training_events ADD COLUMN max_capacity integer;
