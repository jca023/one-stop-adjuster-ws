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

    // Check registration deadline (defaults to 1 hour before event start)
    let effectiveDeadline: Date | null = null;
    if (event.registration_deadline) {
      effectiveDeadline = new Date(event.registration_deadline);
    } else if (event.start_time) {
      effectiveDeadline = new Date(`${event.event_date}T${event.start_time}`);
      effectiveDeadline.setHours(effectiveDeadline.getHours() - 1);
    }
    if (effectiveDeadline && effectiveDeadline < new Date()) {
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

    // Upsert registration
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
    const platformFeeInCents = Math.round(feeInCents * 0.03);

    const connectedAccountId = Deno.env.get('STRIPE_CONNECTED_ACCOUNT_ID');
    const siteUrl = Deno.env.get('SITE_URL') || 'https://one-stop-adjuster-ws-production.up.railway.app';

    const sessionParams: Record<string, unknown> = {
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
      success_url: `${siteUrl}/resources?registration=success`,
      cancel_url: `${siteUrl}/resources?registration=cancelled`,
    };

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

  const amount = Number(reg.amount_paid) > 0 ? `$${Number(reg.amount_paid).toFixed(2)}` : 'Free';
  const classLink = event.url
    ? `<p style="margin:16px 0"><a href="${event.url}" style="background:#d4a843;color:#1a2332;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Join Class</a></p>`
    : '';

  // Student confirmation
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail,
      to: [reg.email as string],
      subject: `You're registered: ${event.title} — ${eventDate}`,
      html: `
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
    .eq('event_id', event.id)
    .in('payment_status', ['paid', 'free']);

  const capacityStr = event.max_capacity ? `${count} of ${event.max_capacity}` : `${count} total`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail,
      to: ['info@one-stop-adjuster.com'],
      subject: `New registration: ${reg.name} for ${event.title}`,
      html: `
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
      `,
    }),
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
