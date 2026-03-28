# Training Registration with Stripe Payments — Design Spec

**Date:** 2026-03-27
**Status:** Approved
**Approach:** Stripe Checkout Sessions via Stripe Connect

---

## Overview

Add a training class registration system to the OSA website. Students register for events on the training calendar, pay via Stripe Checkout, and receive email confirmations with class links. Todd/Pam manage registrations, refunds, and rosters from the admin panel. John earns a 3% platform fee on every transaction via Stripe Connect.

---

## 1. User Registration Flow

1. Student visits Resources > Training tab, sees the calendar.
2. Clicks on a future event with fee > $0.
3. Event card shows fee, description, and a **"Register & Pay"** button (replaces Venmo link).
4. Clicking opens a **registration modal** with fields:
   - Name (required)
   - Email (required)
   - Cell Phone (required)
   - Company / LLC (optional)
5. Student clicks **"Continue to Payment"**.
6. Frontend calls `create-checkout` Edge Function:
   - Saves a `pending` registration to the DB
   - Creates a Stripe Checkout Session (fee + 3% platform fee, routed to Todd's connected account)
   - Returns the Checkout URL
7. Student is redirected to Stripe's hosted payment page.
8. After payment, Stripe redirects back to OSA site with a success message.
9. Stripe fires webhook → `handle-stripe-webhook` Edge Function:
   - Updates registration status to `paid`
   - Sends confirmation email to student (class details + join link)
   - Sends notification email to Todd (registrant details + headcount)

**Free events (fee = 0):** Same modal, button says **"Register"**. No Stripe redirect. Registration saves immediately, confirmation email sends right away with class link.

---

## 2. Database Schema

### New table: `training_registrations`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | DEFAULT gen_random_uuid() |
| event_id | uuid FK | References training_events(id) |
| name | text NOT NULL | Student's full name |
| email | text NOT NULL | Student's email |
| phone | text NOT NULL | Cell phone number |
| company | text | Optional — company or LLC name |
| payment_status | text NOT NULL | `pending`, `paid`, `free`, `refunded` |
| stripe_session_id | text | Stripe Checkout Session ID (null for free) |
| stripe_payment_intent_id | text | For processing refunds |
| amount_paid | decimal(10,2) DEFAULT 0 | What the student paid |
| registered_at | timestamptz | DEFAULT now() |

**Unique constraint:** `(event_id, email)` — no duplicate registrations.

**RLS:** Public read for registration count checks. Insert via Edge Function (service role key). No direct client writes.

### Alter existing `training_events` table:

| New Column | Type | Notes |
|---|---|---|
| registration_deadline | timestamptz | Optional — hides Register button after this |
| max_capacity | integer | Optional — null = unlimited. Hides Register when full |

Existing fields `fee`, `url`, `venmo_qr_url` remain unchanged. `venmo_qr_url` stops being rendered in the calendar UI.

---

## 3. Admin Panel — Registration Management

**New sub-tab in AdminTrainingPage:** "Registrations" (alongside Categories, Calendar Events, Training Videos)

### UI:
- **Event selector dropdown** — filters registrations by event
- **Summary bar:** X registered | X paid | X pending | $X revenue
- **Registrant list per event:**
  - Name, email, phone, company
  - Payment status badge (paid=green, pending=yellow, refunded=red, free=blue)
  - Amount paid
  - Registration date
- **Per-registrant actions:**
  - Refund button (calls Stripe API via Edge Function, updates status to `refunded`)
  - Delete registration (with confirmation dialog)
- **Export to CSV** button — downloads roster
- **Registration deadline display** for selected event

### Admin event editor updates:
- Add **Registration Deadline** date/time picker field
- Add **Max Capacity** number input field
- Venmo QR URL field remains but is deprioritized (Stripe replaces it)

---

## 4. Email Notifications

Both sent from **info@one-stop-adjuster.com** via Resend (already configured).

### Email 1 — Student Confirmation
- **Trigger:** After successful payment (or free registration)
- **Subject:** "You're registered: [Event Title] — [Event Date]"
- **Body:**
  - Welcome message with student name
  - Event details: title, date, time, location type
  - Class join link (from event `url` field)
  - Amount paid (or "Free")
  - Contact: info@one-stop-adjuster.com

### Email 2 — Todd Notification
- **Trigger:** Same time as student confirmation
- **Subject:** "New registration: [Student Name] for [Event Title]"
- **Body:**
  - Registrant: name, email, phone, company
  - Event name and date
  - Amount paid
  - Current headcount: "Registration #X of Y"
  - Link to admin registrations page

Simple, clean HTML. Matches existing contact form email style.

**Testing:** Use johnny@johnnyweb.com for all email testing.

---

## 5. Stripe Connect Architecture

### Account Structure:
- **Platform account:** John's Stripe account (Stripe Connect enabled)
- **Connected account:** Todd's Stripe account (linked via OAuth)
- **Application fee:** 3% on every paid registration

### Environment Variables:

| Variable | Location | Purpose |
|---|---|---|
| STRIPE_SECRET_KEY | Supabase secret | Platform secret key |
| VITE_STRIPE_PUBLISHABLE_KEY | .env | Frontend Checkout redirect |
| STRIPE_WEBHOOK_SECRET | Supabase secret | Webhook signature verification |
| STRIPE_CONNECTED_ACCOUNT_ID | Supabase secret | Todd's connected account (acct_xxx) |

### New Edge Functions:

**`create-checkout`:**
- Input: event_id, name, email, phone, company
- Validates event exists, is published, has capacity, deadline not passed
- Inserts `pending` registration into training_registrations
- Creates Stripe Checkout Session:
  - line_items: event title + fee
  - application_fee_amount: 3% of fee (in cents)
  - transfer_data.destination: Todd's connected account
  - success_url: OSA site with success message
  - cancel_url: OSA site training page
  - metadata: registration_id, event_id
- Returns: { checkout_url }
- Free events (fee=0): skips Stripe, saves registration as `free`, sends emails immediately

**`handle-stripe-webhook`:**
- Verifies Stripe signature
- Handles `checkout.session.completed` event
- Extracts registration_id from metadata
- Updates registration: payment_status=`paid`, stripe_payment_intent_id, amount_paid
- Sends student confirmation email
- Sends Todd notification email
- Returns 200

**`refund-registration`:**
- Input: registration_id
- Looks up stripe_payment_intent_id
- Calls Stripe refund API (refund goes to student, application fee returned to John's account)
- Updates registration: payment_status=`refunded`
- Returns success/failure

### New npm package:
- `@stripe/stripe-js` — frontend, for `redirectToCheckout()`

---

## 6. TrainingCalendar UI Changes

### Event card updates for events with fee > 0:
- **Replace Venmo link** with **"Register & Pay"** button (gold, prominent)
- Show current registration count if max_capacity set: "8 / 25 spots filled"
- Show "Registration Closed" if deadline passed or capacity full
- Past events: no registration button (existing behavior)

### Event card updates for free events:
- Show **"Register"** button (surf-blue)
- Same capacity/deadline logic

### Registration modal:
- Opens on Register/Register & Pay click
- Fields: Name, Email, Cell Phone, Company/LLC
- Submit button: "Continue to Payment" (paid) or "Complete Registration" (free)
- Loading state while Edge Function processes
- Error handling: duplicate registration, event full, deadline passed

### Success state:
- After Stripe redirect back: show success message on the training page
- "You're registered for [Event]. Check your email for confirmation and class details."

---

## 7. What Gets Built Now vs. Later

### Build now (test mode):
- training_registrations table + training_events alterations (migration 010)
- Registration modal on TrainingCalendar
- create-checkout Edge Function (with test Stripe keys)
- handle-stripe-webhook Edge Function
- refund-registration Edge Function
- Admin registrations tab
- Email templates
- Full flow testing with fake cards and johnny@johnnyweb.com

### Build later (when Todd has Stripe):
- Swap test keys for live keys
- Set Todd's connected account ID
- Configure webhook endpoint in Stripe dashboard for production URL
- Flip to live mode

---

## 8. Testing Plan

- **Stripe test cards:**
  - `4242 4242 4242 4242` — successful payment
  - `4000 0000 0000 0002` — declined card
  - Any future expiry, any 3-digit CVC
- **Email testing:** All emails to johnny@johnnyweb.com
- **Verify full flow:** Register → Pay → Confirmation email → Admin roster updated
- **Verify free flow:** Register → Immediate confirmation email → Admin roster
- **Verify refund:** Admin clicks refund → Status updates → Stripe processes refund
- **Verify deadline:** Event past deadline → Register button hidden
- **Verify capacity:** Event full → Register button shows "Registration Closed"
- **Build passes:** `npm run build` clean

---

## Critical Files

| File | Change |
|---|---|
| `src/components/TrainingCalendar.tsx` | Registration modal, Register & Pay button |
| `src/pages/admin/AdminTrainingPage.tsx` | Registrations tab, deadline/capacity fields |
| `src/lib/supabase.ts` | TrainingRegistration interface, TrainingEvent updates |
| `supabase/migrations/010_training_registrations.sql` | New table + alter training_events |
| `supabase/functions/create-checkout/index.ts` | New Edge Function |
| `supabase/functions/handle-stripe-webhook/index.ts` | New Edge Function |
| `supabase/functions/refund-registration/index.ts` | New Edge Function |
| `.env` | VITE_STRIPE_PUBLISHABLE_KEY |
| `package.json` | @stripe/stripe-js dependency |
