import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubmissionPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  submission_type: 'contact' | 'demo';
  message?: string;
  demo_type?: string;
  attendees?: string;
  preferred_date?: string;
  preferred_time?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: SubmissionPayload = await req.json();

    // Validate required fields
    if (!payload.name?.trim() || !payload.email?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Name and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert into database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() || null,
        company: payload.company?.trim() || null,
        submission_type: payload.submission_type || 'contact',
        message: payload.message?.trim() || null,
        demo_type: payload.demo_type || null,
        attendees: payload.attendees || null,
        preferred_date: payload.preferred_date || null,
        preferred_time: payload.preferred_time || null,
      })
      .select()
      .single();

    if (error) {
      console.error('DB insert error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email notification via Resend (if configured)
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const isDemo = payload.submission_type === 'demo';
      const subject = isDemo
        ? `New Demo Request from ${payload.name}`
        : `New Contact Form Submission from ${payload.name}`;

      const htmlBody = buildEmailHtml(payload, isDemo);

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: Deno.env.get('RESEND_FROM_EMAIL') || 'OSA Website <onboarding@resend.dev>',
          to: ['info@one-stop-adjuster.com'],
          subject,
          html: htmlBody,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error('Resend error:', errText);
        // Don't fail the request — submission is already saved
      }
    } else {
      console.log('RESEND_API_KEY not set — skipping email notification');
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildEmailHtml(payload: SubmissionPayload, isDemo: boolean): string {
  const rows = [
    ['Name', payload.name],
    ['Email', payload.email],
    payload.phone ? ['Phone', payload.phone] : null,
    payload.company ? ['Company', payload.company] : null,
    isDemo && payload.demo_type ? ['Demo Type', payload.demo_type] : null,
    isDemo && payload.attendees ? ['Attendees', payload.attendees] : null,
    isDemo && payload.preferred_date ? ['Preferred Date', payload.preferred_date] : null,
    isDemo && payload.preferred_time ? ['Preferred Time', payload.preferred_time] : null,
    payload.message ? ['Message', payload.message] : null,
  ].filter(Boolean) as [string, string][];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0;width:140px">${label}</td><td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${escapeHtml(value)}</td></tr>`
    )
    .join('');

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a2332;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="color:#d4a843;margin:0;font-size:20px">
          ${isDemo ? 'New Demo Request' : 'New Contact Submission'}
        </h1>
        <p style="color:#94a3b8;margin:8px 0 0;font-size:14px">From the One Stop Adjuster website</p>
      </div>
      <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <table style="width:100%;border-collapse:collapse">${rowsHtml}</table>
        <p style="color:#94a3b8;font-size:12px;margin:16px 0 0">
          Submitted at ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT
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
