# Training Registration with Stripe Payments — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add training class registration with Stripe Checkout payments, email confirmations, and admin management to the OSA website.

**Architecture:** Stripe Checkout Sessions via Stripe Connect. Frontend registration modal on TrainingCalendar collects registrant info, calls a Supabase Edge Function that creates a Checkout Session, redirects to Stripe, and a webhook handler confirms payment and sends emails. Admin panel gets a Registrations tab for roster management and refunds.

**Tech Stack:** React 19, TypeScript, Supabase (Postgres + Edge Functions + Secrets), Stripe Checkout + Connect, Resend (email), Framer Motion

---

## File Structure

### New files:
| File | Responsibility |
|---|---|
| `supabase/migrations/010_training_registrations.sql` | New table + alter training_events |
| `src/components/RegistrationModal.tsx` | Registration form modal (name, email, phone, company) |
| `supabase/functions/create-checkout/index.ts` | Creates Stripe Checkout Session + pending registration |
| `supabase/functions/handle-stripe-webhook/index.ts` | Confirms payment, sends emails |
| `supabase/functions/refund-registration/index.ts` | Processes Stripe refund from admin |

### Modified files:
| File | Changes |
|---|---|
| `src/lib/supabase.ts` | Add TrainingRegistration interface, update TrainingEvent |
| `src/components/TrainingCalendar.tsx` | Add Register & Pay button, replace Venmo link, capacity display |
| `src/pages/admin/AdminTrainingPage.tsx` | Add Registrations sub-tab, deadline/capacity fields in editor |
| `src/pages/ResourcesPage.tsx` | Success message after Stripe redirect |
| `.env` | Add VITE_STRIPE_PUBLISHABLE_KEY |
| `.env.example` | Add VITE_STRIPE_PUBLISHABLE_KEY placeholder |
| `package.json` | Add @stripe/stripe-js |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/010_training_registrations.sql`
- Modify: `src/lib/supabase.ts:40-55`

- [ ] **Step 1: Create migration file**

```sql
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

-- Public can check registration count (for capacity display)
CREATE POLICY "Public can read registration counts" ON training_registrations
  FOR SELECT USING (true);

-- Add registration fields to training_events
ALTER TABLE training_events ADD COLUMN registration_deadline timestamptz;
ALTER TABLE training_events ADD COLUMN max_capacity integer;
```

- [ ] **Step 2: Push migration to Supabase**

Run: `npx supabase db push --linked`
Expected: "Applying migration 010_training_registrations.sql... Finished"

- [ ] **Step 3: Verify table exists via REST API**

Run:
```bash
source .env; eval $(grep -E '^VITE_SUPABASE' .env)
curl -s "${VITE_SUPABASE_URL}/rest/v1/training_registrations?select=id&limit=1" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}"
```
Expected: `[]` (empty array, no error)

- [ ] **Step 4: Update TypeScript interfaces**

In `src/lib/supabase.ts`, add after the `ModuleVideo` interface:

```typescript
export interface TrainingRegistration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  payment_status: 'pending' | 'paid' | 'free' | 'refunded';
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_paid: number;
  registered_at: string;
}
```

Update the existing `TrainingEvent` interface — add two fields at the end (before `created_at`):

```typescript
  registration_deadline: string | null;
  max_capacity: number | null;
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/010_training_registrations.sql src/lib/supabase.ts
git commit -m "feat: add training_registrations table and update TrainingEvent type"
```

---

## Task 2: Install Stripe and Add Environment Variables

**Files:**
- Modify: `package.json`
- Modify: `.env`
- Modify: `.env.example`

- [ ] **Step 1: Install @stripe/stripe-js**

Run: `npm install @stripe/stripe-js`

- [ ] **Step 2: Add Stripe publishable key to .env**

Append to `.env`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
```

Append to `.env.example`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds (Stripe package installed but not yet imported)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "feat: install @stripe/stripe-js and add env placeholder"
```

---

## Task 3: Registration Modal Component

**Files:**
- Create: `src/components/RegistrationModal.tsx`

- [ ] **Step 1: Create the modal component**

```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import type { TrainingEvent } from '../lib/supabase';

interface RegistrationModalProps {
  event: TrainingEvent;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegistrationModal({ event, onClose, onSuccess }: RegistrationModalProps): React.JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFree = !event.fee || event.fee === 0;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          event_id: event.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.checkout_url) {
        // Paid event — redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        // Free event — registration complete
        onSuccess();
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative glass rounded-2xl p-6 md:p-8 w-full max-w-md z-10"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--color-mist)] hover:text-[var(--color-pearl)] hover:bg-[var(--color-ocean)]/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-1">Register for Training</h3>
        <p className="text-sm text-[var(--color-mist)] mb-6">{event.title}</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-pearl)] mb-1">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-pearl)] mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-pearl)] mb-1">Cell Phone *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-pearl)] mb-1">Company / LLC</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
            />
          </div>

          {event.fee > 0 && (
            <div className="pt-2 border-t border-[var(--color-ocean)]/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-mist)]">Registration Fee</span>
                <span className="font-bold text-[var(--color-gold)]">${Number(event.fee).toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : isFree ? (
              'Complete Registration'
            ) : (
              'Continue to Payment'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Passes (component created but not yet imported anywhere)

- [ ] **Step 3: Commit**

```bash
git add src/components/RegistrationModal.tsx
git commit -m "feat: add RegistrationModal component for training sign-up"
```

---

## Task 4: Update TrainingCalendar with Register Button

**Files:**
- Modify: `src/components/TrainingCalendar.tsx:1-446`

- [ ] **Step 1: Add imports at top of file**

After existing imports (line 5), add:

```typescript
import { AnimatePresence as AP } from 'framer-motion';
import RegistrationModal from './RegistrationModal';
```

Note: `AnimatePresence` is already imported on line 2 — we'll reuse it. No need for `AP`. Just add the RegistrationModal import:

```typescript
import RegistrationModal from './RegistrationModal';
```

Also add `supabase` usage for registration count. Already imported on line 4.

- [ ] **Step 2: Add registration state and count fetching**

Inside the component function (after `const detailPanelRef` on line 56), add:

```typescript
  const [registerEvent, setRegisterEvent] = useState<TrainingEvent | null>(null);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Fetch registration counts for visible events
  useEffect(() => {
    async function fetchCounts(): Promise<void> {
      if (events.length === 0) return;
      const eventIds = events.map((e) => e.id);
      const { data } = await supabase
        .from('training_registrations')
        .select('event_id')
        .in('event_id', eventIds)
        .in('payment_status', ['paid', 'free']);
      if (data) {
        const counts: Record<string, number> = {};
        for (const row of data) {
          counts[row.event_id] = (counts[row.event_id] || 0) + 1;
        }
        setRegistrationCounts(counts);
      }
    }
    fetchCounts();
  }, [events]);
```

- [ ] **Step 3: Replace Venmo link with Register & Pay button**

In the event detail panel, replace the fee/Venmo section (lines 387-405):

Old code:
```typescript
                        {ev.fee > 0 && (
                          <div className="flex items-center gap-3 pt-1 border-t border-[var(--color-ocean)]/15">
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-success)] pt-2">
                              <DollarSign className="w-3.5 h-3.5" />
                              {Number(ev.fee).toFixed(2)}
                            </span>
                            {ev.venmo_qr_url && (
                              <a
                                href={ev.venmo_qr_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[var(--color-surf)] hover:underline flex items-center gap-1 pt-2"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Pay via Venmo
                              </a>
                            )}
                          </div>
                        )}
```

New code:
```typescript
                        {/* Registration section */}
                        {!isPast && (
                          <div className="pt-2 border-t border-[var(--color-ocean)]/15">
                            {ev.fee > 0 && (
                              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-success)] mb-2">
                                <DollarSign className="w-3.5 h-3.5" />
                                {Number(ev.fee).toFixed(2)}
                              </span>
                            )}
                            {ev.max_capacity && (
                              <p className="text-xs text-[var(--color-mist)] mb-2">
                                {registrationCounts[ev.id] || 0} / {ev.max_capacity} spots filled
                              </p>
                            )}
                            {(() => {
                              const now = new Date();
                              const deadlinePassed = ev.registration_deadline && new Date(ev.registration_deadline) < now;
                              const isFull = ev.max_capacity && (registrationCounts[ev.id] || 0) >= ev.max_capacity;
                              if (deadlinePassed) return <p className="text-xs text-[var(--color-wave)] italic">Registration closed</p>;
                              if (isFull) return <p className="text-xs text-[var(--color-wave)] italic">Class is full</p>;
                              return (
                                <button
                                  onClick={() => setRegisterEvent(ev)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
                                  style={{
                                    backgroundColor: 'color-mix(in srgb, var(--color-gold) 20%, transparent)',
                                    color: 'var(--color-gold)',
                                    border: '1px solid color-mix(in srgb, var(--color-gold) 35%, transparent)',
                                  }}
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  {ev.fee > 0 ? 'Register & Pay' : 'Register'}
                                </button>
                              );
                            })()}
                          </div>
                        )}
```

- [ ] **Step 4: Add registration modal and success message at end of component**

Before the closing `</div>` of the component (line 443), add:

```typescript
      {/* Registration modal */}
      <AnimatePresence>
        {registerEvent && (
          <RegistrationModal
            event={registerEvent}
            onClose={() => setRegisterEvent(null)}
            onSuccess={() => {
              setRegisterEvent(null);
              setRegistrationSuccess(true);
              setTimeout(() => setRegistrationSuccess(false), 8000);
            }}
          />
        )}
      </AnimatePresence>

      {/* Success banner */}
      <AnimatePresence>
        {registrationSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] text-sm text-center"
          >
            Registration complete! Check your email for confirmation and class details.
          </motion.div>
        )}
      </AnimatePresence>
```

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/components/TrainingCalendar.tsx
git commit -m "feat: add Register & Pay button to TrainingCalendar with capacity/deadline logic"
```

---

## Task 5: Create Checkout Edge Function

**Files:**
- Create: `supabase/functions/create-checkout/index.ts`

- [ ] **Step 1: Create the Edge Function**

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutPayload {
  event_id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: CheckoutPayload = await req.json();

    if (!payload.event_id || !payload.name?.trim() || !payload.email?.trim() || !payload.phone?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Event ID, name, email, and phone are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch the event
    const { data: event, error: eventError } = await supabase
      .from('training_events')
      .select('*')
      .eq('id', payload.event_id)
      .eq('status', 'published')
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Event not found or not published' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check registration deadline
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Registration has closed for this event' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check capacity
    if (event.max_capacity) {
      const { count } = await supabase
        .from('training_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', payload.event_id)
        .in('payment_status', ['paid', 'free']);

      if ((count || 0) >= event.max_capacity) {
        return new Response(
          JSON.stringify({ error: 'This class is full' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for duplicate registration
    const { data: existing } = await supabase
      .from('training_registrations')
      .select('id, payment_status')
      .eq('event_id', payload.event_id)
      .eq('email', payload.email.trim())
      .single();

    if (existing && existing.payment_status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'You are already registered for this event' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isFree = !event.fee || event.fee === 0;

    // Upsert registration (handles re-attempts for pending registrations)
    const regPayload = {
      event_id: payload.event_id,
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      company: payload.company?.trim() || null,
      payment_status: isFree ? 'free' : 'pending',
      amount_paid: isFree ? 0 : event.fee,
      registered_at: new Date().toISOString(),
    };

    let registrationId: string;

    if (existing) {
      // Update existing pending registration
      const { data: updated, error: updateErr } = await supabase
        .from('training_registrations')
        .update(regPayload)
        .eq('id', existing.id)
        .select()
        .single();
      if (updateErr) throw updateErr;
      registrationId = updated.id;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('training_registrations')
        .insert(regPayload)
        .select()
        .single();
      if (insertErr) throw insertErr;
      registrationId = inserted.id;
    }

    // Free event — send confirmation email immediately
    if (isFree) {
      await sendConfirmationEmails(event, regPayload, supabase);
      return new Response(
        JSON.stringify({ success: true, free: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Paid event — create Stripe Checkout Session
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Payment system not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const feeInCents = Math.round(event.fee * 100);
    const platformFeeInCents = Math.round(feeInCents * 0.03); // 3% platform fee

    const connectedAccountId = Deno.env.get('STRIPE_CONNECTED_ACCOUNT_ID');

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: event.title,
            description: `Training event on ${event.event_date}`,
          },
          unit_amount: feeInCents,
        },
        quantity: 1,
      }],
      customer_email: payload.email.trim(),
      metadata: {
        registration_id: registrationId,
        event_id: payload.event_id,
      },
      success_url: `${Deno.env.get('SITE_URL') || 'https://one-stop-adjuster-ws-production.up.railway.app'}/resources?registration=success`,
      cancel_url: `${Deno.env.get('SITE_URL') || 'https://one-stop-adjuster-ws-production.up.railway.app'}/resources?registration=cancelled`,
    };

    // If connected account is configured, route payment to Todd with platform fee
    if (connectedAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFeeInCents,
        transfer_data: {
          destination: connectedAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Store session ID on registration
    await supabase
      .from('training_registrations')
      .update({ stripe_session_id: session.id })
      .eq('id', registrationId);

    return new Response(
      JSON.stringify({ success: true, checkout_url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Checkout error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendConfirmationEmails(
  event: Record<string, unknown>,
  reg: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
): Promise<void> {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return;

  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'OSA Website <onboarding@resend.dev>';
  const eventDate = new Date(event.event_date as string).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Email 1: Student confirmation
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail,
      to: [reg.email as string],
      subject: `You're registered: ${event.title} — ${eventDate}`,
      html: buildStudentEmail(event, reg, eventDate),
    }),
  });

  // Email 2: Todd notification
  const { count } = await supabase
    .from('training_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .in('payment_status', ['paid', 'free']);

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail,
      to: ['info@one-stop-adjuster.com'],
      subject: `New registration: ${reg.name} for ${event.title}`,
      html: buildToddEmail(event, reg, eventDate, count || 0, event.max_capacity as number | null),
    }),
  });
}

function buildStudentEmail(event: Record<string, unknown>, reg: Record<string, unknown>, eventDate: string): string {
  const amount = Number(reg.amount_paid) > 0 ? `$${Number(reg.amount_paid).toFixed(2)}` : 'Free';
  const classLink = event.url ? `<p style="margin:16px 0"><a href="${event.url}" style="background:#d4a843;color:#1a2332;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Join Class</a></p>` : '';

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a2332;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="color:#d4a843;margin:0;font-size:20px">You're Registered!</h1>
        <p style="color:#94a3b8;margin:8px 0 0;font-size:14px">One Stop Adjuster Training</p>
      </div>
      <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <p style="color:#334155;font-size:16px">Hi ${escapeHtml(reg.name as string)},</p>
        <p style="color:#475569">You're confirmed for the following training event:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Event</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${escapeHtml(event.title as string)}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Date</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${eventDate}</td></tr>
          ${event.start_time ? `<tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Time</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${event.start_time}${event.end_time ? ' – ' + event.end_time : ''}</td></tr>` : ''}
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Amount</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${amount}</td></tr>
        </table>
        ${classLink}
        <p style="color:#94a3b8;font-size:12px;margin:16px 0 0">Questions? Contact <a href="mailto:info@one-stop-adjuster.com">info@one-stop-adjuster.com</a></p>
      </div>
    </div>
  `;
}

function buildToddEmail(event: Record<string, unknown>, reg: Record<string, unknown>, eventDate: string, count: number, maxCapacity: number | null): string {
  const capacityStr = maxCapacity ? `${count} of ${maxCapacity}` : `${count} total`;
  const amount = Number(reg.amount_paid) > 0 ? `$${Number(reg.amount_paid).toFixed(2)}` : 'Free';

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a2332;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="color:#d4a843;margin:0;font-size:20px">New Registration</h1>
        <p style="color:#94a3b8;margin:8px 0 0;font-size:14px">${escapeHtml(event.title as string)} — ${eventDate}</p>
      </div>
      <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Name</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${escapeHtml(reg.name as string)}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Email</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${escapeHtml(reg.email as string)}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Phone</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${escapeHtml(reg.phone as string)}</td></tr>
          ${reg.company ? `<tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Company</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${escapeHtml(reg.company as string)}</td></tr>` : ''}
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Amount</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${amount}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Registrations</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${capacityStr}</td></tr>
        </table>
        <p style="color:#94a3b8;font-size:12px;margin:16px 0 0">
          <a href="https://one-stop-adjuster-ws-production.up.railway.app/admin/training">View in Admin Panel</a>
        </p>
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

- [ ] **Step 2: Deploy Edge Function**

Run: `npx supabase functions deploy create-checkout --project-ref ewyfhzqyglermdlbvyty`

- [ ] **Step 3: Set Stripe secrets**

Run:
```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_placeholder --project-ref ewyfhzqyglermdlbvyty
npx supabase secrets set STRIPE_CONNECTED_ACCOUNT_ID= --project-ref ewyfhzqyglermdlbvyty
npx supabase secrets set SITE_URL=https://one-stop-adjuster-ws-production.up.railway.app --project-ref ewyfhzqyglermdlbvyty
```

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/create-checkout/index.ts
git commit -m "feat: add create-checkout Edge Function for Stripe registration"
```

---

## Task 6: Stripe Webhook Handler Edge Function

**Files:**
- Create: `supabase/functions/handle-stripe-webhook/index.ts`

- [ ] **Step 1: Create the webhook handler**

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

Deno.serve(async (req: Request) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event: Stripe.Event;

  if (webhookSecret) {
    const signature = req.headers.get('stripe-signature')!;
    const body = await req.text();
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }
  } else {
    // Dev mode — no signature verification
    const body = await req.json();
    event = body as Stripe.Event;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const registrationId = session.metadata?.registration_id;
    const eventId = session.metadata?.event_id;

    if (!registrationId) {
      console.error('No registration_id in session metadata');
      return new Response('OK', { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Update registration to paid
    const { data: reg, error: updateErr } = await supabase
      .from('training_registrations')
      .update({
        payment_status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
        amount_paid: (session.amount_total || 0) / 100,
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (updateErr) {
      console.error('Failed to update registration:', updateErr);
      return new Response('DB error', { status: 500 });
    }

    // Fetch the event for email content
    const { data: trainingEvent } = await supabase
      .from('training_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (trainingEvent && reg) {
      // Send confirmation emails (reuse pattern from create-checkout)
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (resendKey) {
        const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'OSA Website <onboarding@resend.dev>';
        const eventDate = new Date(trainingEvent.event_date).toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });

        const amount = `$${Number(reg.amount_paid).toFixed(2)}`;
        const classLink = trainingEvent.url
          ? `<p style="margin:16px 0"><a href="${trainingEvent.url}" style="background:#d4a843;color:#1a2332;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Join Class</a></p>`
          : '';

        // Student confirmation
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: [reg.email],
            subject: `You're registered: ${trainingEvent.title} — ${eventDate}`,
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
                <div style="background:#1a2332;padding:24px;border-radius:8px 8px 0 0">
                  <h1 style="color:#d4a843;margin:0;font-size:20px">You're Registered!</h1>
                  <p style="color:#94a3b8;margin:8px 0 0;font-size:14px">One Stop Adjuster Training</p>
                </div>
                <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
                  <p style="color:#334155;font-size:16px">Hi ${reg.name},</p>
                  <p style="color:#475569">You're confirmed for the following training event:</p>
                  <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Event</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${trainingEvent.title}</td></tr>
                    <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Date</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${eventDate}</td></tr>
                    <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Amount</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${amount}</td></tr>
                  </table>
                  ${classLink}
                  <p style="color:#94a3b8;font-size:12px;margin:16px 0 0">Questions? Contact <a href="mailto:info@one-stop-adjuster.com">info@one-stop-adjuster.com</a></p>
                </div>
              </div>
            `,
          }),
        });

        // Todd notification
        const { count } = await supabase
          .from('training_registrations')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .in('payment_status', ['paid', 'free']);

        const capacityStr = trainingEvent.max_capacity ? `${count} of ${trainingEvent.max_capacity}` : `${count} total`;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: ['info@one-stop-adjuster.com'],
            subject: `New registration: ${reg.name} for ${trainingEvent.title}`,
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
                <div style="background:#1a2332;padding:24px;border-radius:8px 8px 0 0">
                  <h1 style="color:#d4a843;margin:0;font-size:20px">New Registration</h1>
                  <p style="color:#94a3b8;margin:8px 0 0;font-size:14px">${trainingEvent.title} — ${eventDate}</p>
                </div>
                <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
                  <table style="width:100%;border-collapse:collapse">
                    <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Name</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${reg.name}</td></tr>
                    <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Email</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${reg.email}</td></tr>
                    <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Phone</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${reg.phone}</td></tr>
                    ${reg.company ? `<tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Company</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${reg.company}</td></tr>` : ''}
                    <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Amount</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${amount}</td></tr>
                    <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Registrations</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${capacityStr}</td></tr>
                  </table>
                </div>
              </div>
            `,
          }),
        });
      }
    }
  }

  return new Response('OK', { status: 200 });
});
```

- [ ] **Step 2: Deploy Edge Function**

Run: `npx supabase functions deploy handle-stripe-webhook --project-ref ewyfhzqyglermdlbvyty --no-verify-jwt`

Note: `--no-verify-jwt` is required because Stripe calls this endpoint directly, not through the Supabase client.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/handle-stripe-webhook/index.ts
git commit -m "feat: add Stripe webhook handler for payment confirmation + emails"
```

---

## Task 7: Refund Edge Function

**Files:**
- Create: `supabase/functions/refund-registration/index.ts`

- [ ] **Step 1: Create the refund Edge Function**

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { registration_id } = await req.json();

    if (!registration_id) {
      return new Response(
        JSON.stringify({ error: 'registration_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: reg, error: fetchErr } = await supabase
      .from('training_registrations')
      .select('*')
      .eq('id', registration_id)
      .single();

    if (fetchErr || !reg) {
      return new Response(
        JSON.stringify({ error: 'Registration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (reg.payment_status === 'refunded') {
      return new Response(
        JSON.stringify({ error: 'Already refunded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process Stripe refund if there was a payment
    if (reg.stripe_payment_intent_id) {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
      await stripe.refunds.create({
        payment_intent: reg.stripe_payment_intent_id,
      });
    }

    // Update registration status
    await supabase
      .from('training_registrations')
      .update({ payment_status: 'refunded' })
      .eq('id', registration_id);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Refund error:', err);
    return new Response(
      JSON.stringify({ error: 'Refund failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

- [ ] **Step 2: Deploy Edge Function**

Run: `npx supabase functions deploy refund-registration --project-ref ewyfhzqyglermdlbvyty`

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/refund-registration/index.ts
git commit -m "feat: add refund-registration Edge Function for admin refunds"
```

---

## Task 8: Admin Registrations Tab

**Files:**
- Modify: `src/pages/admin/AdminTrainingPage.tsx`

- [ ] **Step 1: Update subTab type and add registrations state**

Change line 162 from:
```typescript
const [subTab, setSubTab] = useState<'events' | 'videos'>('events');
```
to:
```typescript
const [subTab, setSubTab] = useState<'events' | 'videos' | 'registrations'>('events');
```

Add state variables after existing state declarations:

```typescript
const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
const [regEvents, setRegEvents] = useState<TrainingEvent[]>([]);
const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
const [regLoading, setRegLoading] = useState(false);
```

Add import for `TrainingRegistration` type at line 25:
```typescript
import type { TrainingEvent, TrainingVideo, TrainingRegistration } from '../../lib/supabase';
```

Add icons import — add `Users, Download, RotateCcw` to the existing import from lucide-react.

- [ ] **Step 2: Add fetchRegistrations function**

```typescript
const fetchRegistrations = useCallback(async () => {
  setRegLoading(true);
  const [{ data: regs }, { data: evts }] = await Promise.all([
    supabase.from('training_registrations').select('*').order('registered_at', { ascending: false }),
    supabase.from('training_events').select('id,title,event_date,max_capacity').order('event_date', { ascending: false }),
  ]);
  if (regs) setRegistrations(regs);
  if (evts) setRegEvents(evts);
  setRegLoading(false);
}, []);

useEffect(() => {
  if (subTab === 'registrations') fetchRegistrations();
}, [subTab, fetchRegistrations]);
```

- [ ] **Step 3: Add Registrations tab button**

After the existing "Training Videos" tab button, add:

```typescript
<button
  onClick={() => setSubTab('registrations')}
  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    subTab === 'registrations'
      ? 'bg-[var(--color-gold)] text-[var(--color-abyss)]'
      : 'text-[var(--color-mist)] hover:bg-[var(--color-ocean)]/30'
  }`}
>
  Registrations
</button>
```

- [ ] **Step 4: Add Registrations tab content**

After the videos tab content block, add the registrations panel:

```typescript
{subTab === 'registrations' && (
  <div className="space-y-6">
    {/* Event filter */}
    <div className="flex items-center gap-4 flex-wrap">
      <select
        value={selectedEventFilter}
        onChange={(e) => setSelectedEventFilter(e.target.value)}
        className="px-4 py-2 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] text-sm"
      >
        <option value="all">All Events</option>
        {regEvents.map((ev) => (
          <option key={ev.id} value={ev.id}>{ev.title} ({ev.event_date})</option>
        ))}
      </select>

      <button
        onClick={() => {
          const filtered = selectedEventFilter === 'all'
            ? registrations
            : registrations.filter((r) => r.event_id === selectedEventFilter);
          const csv = [
            'Name,Email,Phone,Company,Status,Amount,Date',
            ...filtered.map((r) =>
              `"${r.name}","${r.email}","${r.phone}","${r.company || ''}","${r.payment_status}","${r.amount_paid}","${r.registered_at}"`
            ),
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'registrations.csv';
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-ocean)]/30 text-[var(--color-surf)] hover:bg-[var(--color-ocean)]/50 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div>

    {/* Summary */}
    {(() => {
      const filtered = selectedEventFilter === 'all'
        ? registrations
        : registrations.filter((r) => r.event_id === selectedEventFilter);
      const paid = filtered.filter((r) => r.payment_status === 'paid').length;
      const free = filtered.filter((r) => r.payment_status === 'free').length;
      const pending = filtered.filter((r) => r.payment_status === 'pending').length;
      const revenue = filtered
        .filter((r) => r.payment_status === 'paid')
        .reduce((sum, r) => sum + Number(r.amount_paid), 0);

      return (
        <div className="flex gap-4 flex-wrap text-sm">
          <span className="px-3 py-1 rounded-full bg-[var(--color-ocean)]/20 text-[var(--color-pearl)]">{filtered.length} registered</span>
          <span className="px-3 py-1 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)]">{paid} paid</span>
          <span className="px-3 py-1 rounded-full bg-[var(--color-surf)]/20 text-[var(--color-surf)]">{free} free</span>
          {pending > 0 && <span className="px-3 py-1 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">{pending} pending</span>}
          <span className="px-3 py-1 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">${revenue.toFixed(2)} revenue</span>
        </div>
      );
    })()}

    {/* Registration list */}
    {regLoading ? (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-5 animate-pulse">
            <div className="h-5 bg-[var(--color-ocean)]/30 rounded w-1/3 mb-2" />
            <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-1/4" />
          </div>
        ))}
      </div>
    ) : (
      <div className="space-y-3">
        {(selectedEventFilter === 'all'
          ? registrations
          : registrations.filter((r) => r.event_id === selectedEventFilter)
        ).map((reg) => {
          const ev = regEvents.find((e) => e.id === reg.event_id);
          const statusColors: Record<string, string> = {
            paid: 'bg-[var(--color-success)]/20 text-[var(--color-success)]',
            free: 'bg-[var(--color-surf)]/20 text-[var(--color-surf)]',
            pending: 'bg-[var(--color-gold)]/20 text-[var(--color-gold)]',
            refunded: 'bg-red-500/20 text-red-400',
          };

          return (
            <div key={reg.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{reg.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[reg.payment_status] || ''}`}>
                    {reg.payment_status}
                  </span>
                </div>
                <div className="text-xs text-[var(--color-mist)] space-x-3">
                  <span>{reg.email}</span>
                  <span>{reg.phone}</span>
                  {reg.company && <span>{reg.company}</span>}
                </div>
                {selectedEventFilter === 'all' && ev && (
                  <div className="text-xs text-[var(--color-wave)] mt-1">{ev.title} — {ev.event_date}</div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {reg.amount_paid > 0 && (
                  <span className="text-sm font-bold text-[var(--color-gold)]">${Number(reg.amount_paid).toFixed(2)}</span>
                )}
                {reg.payment_status === 'paid' && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Refund ${reg.name}?`)) return;
                      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
                      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
                      const res = await fetch(`${supabaseUrl}/functions/v1/refund-registration`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${supabaseKey}`,
                        },
                        body: JSON.stringify({ registration_id: reg.id }),
                      });
                      if (res.ok) fetchRegistrations();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Refund
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (!confirm(`Delete registration for ${reg.name}?`)) return;
                    await supabase.from('training_registrations').delete().eq('id', reg.id);
                    fetchRegistrations();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
        {registrations.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center">
            <Users className="w-12 h-12 text-[var(--color-wave)] mx-auto mb-4" />
            <p className="text-[var(--color-mist)]">No registrations yet.</p>
          </div>
        )}
      </div>
    )}
  </div>
)}
```

- [ ] **Step 5: Add registration_deadline and max_capacity fields to event editor modal**

In the event editor modal, after the Recording URL field and before the Paid Event toggle, add:

```typescript
{/* Registration fields */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-[var(--color-pearl)] mb-1">Registration Deadline</label>
    <input
      type="datetime-local"
      value={editingEvent.registration_deadline?.slice(0, 16) || ''}
      onChange={(e) => setEditingEvent({ ...editingEvent, registration_deadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
      className="w-full px-4 py-2 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm [color-scheme:dark]"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-[var(--color-pearl)] mb-1">Max Capacity</label>
    <input
      type="number"
      min="1"
      value={editingEvent.max_capacity || ''}
      onChange={(e) => setEditingEvent({ ...editingEvent, max_capacity: e.target.value ? parseInt(e.target.value) : null })}
      placeholder="Unlimited"
      className="w-full px-4 py-2 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
    />
  </div>
</div>
```

Also update `emptyEvent` at line 30 to include the new fields:
```typescript
  registration_deadline: null,
  max_capacity: null,
```

And update the save payload to include them.

- [ ] **Step 6: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/AdminTrainingPage.tsx
git commit -m "feat: add admin Registrations tab with roster, refunds, CSV export"
```

---

## Task 9: Handle Stripe Redirect Success on Resources Page

**Files:**
- Modify: `src/pages/ResourcesPage.tsx`

- [ ] **Step 1: Add success message handling**

At the top of the ResourcesPage component, add:

```typescript
const [searchParams] = useSearchParams();
const registrationStatus = searchParams.get('registration');
```

Add import: `import { useSearchParams } from 'react-router-dom';`

After the tab buttons and before the tab content, add:

```typescript
{registrationStatus === 'success' && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] text-sm text-center max-w-2xl mx-auto"
  >
    Registration complete! Check your email for confirmation and class details.
  </motion.div>
)}

{registrationStatus === 'cancelled' && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 p-4 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 text-[var(--color-gold)] text-sm text-center max-w-2xl mx-auto"
  >
    Payment was cancelled. You can try registering again from the training calendar.
  </motion.div>
)}
```

- [ ] **Step 2: Auto-switch to training tab on registration redirect**

In the component, add an effect:

```typescript
useEffect(() => {
  if (registrationStatus) setActiveTab('training');
}, [registrationStatus]);
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/pages/ResourcesPage.tsx
git commit -m "feat: show registration success/cancelled message on Resources page"
```

---

## Task 10: Final Build, Browser Test, and Deploy

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Clean build, no errors

- [ ] **Step 2: Browser test — free registration flow**

1. Navigate to http://localhost:5173/resources
2. Click Training tab
3. Find a free event (fee = 0) on the calendar
4. Click "Register" button
5. Fill in: Test User, johnny@johnnyweb.com, 555-123-4567, Test LLC
6. Click "Complete Registration"
7. Verify success message appears
8. Check johnny@johnnyweb.com for confirmation email

- [ ] **Step 3: Browser test — paid registration flow (requires Stripe test keys)**

1. Find a paid event on the calendar
2. Click "Register & Pay"
3. Fill in registration form, click "Continue to Payment"
4. Should redirect to Stripe Checkout (will fail with placeholder keys — expected)
5. Once real test keys are set: use card 4242 4242 4242 4242, any future date, any CVC
6. Verify redirect back to Resources page with success message
7. Check emails

- [ ] **Step 4: Browser test — admin registrations**

1. Navigate to http://localhost:5173/admin/training
2. Click "Registrations" tab
3. Verify test registration appears with correct data
4. Test CSV export
5. Test refund button (if Stripe configured)

- [ ] **Step 5: Commit all remaining changes**

```bash
git add -A
git commit -m "feat: training registration with Stripe payments — complete flow"
```

- [ ] **Step 6: Push, create PR, merge, deploy**

```bash
git push -u origin feat/training-registration-stripe
gh pr create --title "Training registration with Stripe payments" --body "..."
gh pr merge <number> --merge --delete-branch
git checkout master && git pull
railway up
```
