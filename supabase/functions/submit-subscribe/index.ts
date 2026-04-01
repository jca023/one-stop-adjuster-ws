import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Upsert into subscribers table
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error } = await supabase
      .from('subscribers')
      .upsert({ email: normalizedEmail }, { onConflict: 'email' });

    if (error) {
      console.error('DB upsert error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save subscriber' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send admin notification email via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const htmlBody = buildEmailHtml(normalizedEmail);

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: Deno.env.get('RESEND_FROM_EMAIL') || 'OSA Website <onboarding@resend.dev>',
          to: ['Stripe-OSA@johnnyweb.com'],
          subject: `New Newsletter Subscriber: ${normalizedEmail}`,
          html: htmlBody,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error('Resend error:', errText);
        // Don't fail the request — subscriber is already saved
      }
    } else {
      console.log('RESEND_API_KEY not set — skipping email notification');
    }

    return new Response(
      JSON.stringify({ success: true }),
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

function buildEmailHtml(email: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a2332;padding:24px;border-radius:8px 8px 0 0">
        <h1 style="color:#d4a843;margin:0;font-size:20px">New Newsletter Subscriber</h1>
        <p style="color:#94a3b8;margin:8px 0 0;font-size:14px">From the One Stop Adjuster website</p>
      </div>
      <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 12px;font-weight:600;color:#334155;border-bottom:1px solid #e2e8f0;width:140px">Email</td>
            <td style="padding:8px 12px;color:#475569;border-bottom:1px solid #e2e8f0">${escapeHtml(email)}</td>
          </tr>
        </table>
        <p style="color:#94a3b8;font-size:12px;margin:16px 0 0">
          Subscribed at ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT
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
