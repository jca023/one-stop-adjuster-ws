import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

Deno.serve(async (req: Request) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return new Response('Stripe not configured', { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
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
            html: buildStudentEmail(reg.name, trainingEvent.title, eventDate, amount, classLink),
          }),
        });

        // Todd notification
        const { count } = await supabase
          .from('training_registrations')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .in('payment_status', ['paid', 'free']);

        const capacityStr = trainingEvent.max_capacity
          ? `${count} of ${trainingEvent.max_capacity}`
          : `${count} total`;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: ['Stripe-OSA@johnnyweb.com'],
            subject: `New registration: ${reg.name} for ${trainingEvent.title}`,
            html: buildToddEmail(reg, trainingEvent.title, eventDate, amount, capacityStr),
          }),
        });
      }
    }
  }

  return new Response('OK', { status: 200 });
});

function buildStudentEmail(name: string, title: string, eventDate: string, amount: string, classLink: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a2332;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="color:#d4a843;margin:0;font-size:20px">You're Registered!</h1>
        <p style="color:#94a3b8;margin:8px 0 0;font-size:14px">One Stop Adjuster Training</p>
      </div>
      <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <p style="color:#334155;font-size:16px">Hi ${escapeHtml(name)},</p>
        <p style="color:#475569">You're confirmed for the following training event:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Event</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${escapeHtml(title)}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Date</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${eventDate}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0">Amount</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${amount}</td></tr>
        </table>
        ${classLink}
        <p style="color:#94a3b8;font-size:12px;margin:16px 0 0">Questions? Contact <a href="mailto:info@one-stop-adjuster.com">info@one-stop-adjuster.com</a></p>
      </div>
    </div>
  `;
}

function buildToddEmail(reg: Record<string, unknown>, title: string, eventDate: string, amount: string, capacityStr: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a2332;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="color:#d4a843;margin:0;font-size:20px">New Registration</h1>
        <p style="color:#94a3b8;margin:8px 0 0;font-size:14px">${escapeHtml(title)} — ${eventDate}</p>
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
