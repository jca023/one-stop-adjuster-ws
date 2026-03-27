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
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
        await stripe.refunds.create({
          payment_intent: reg.stripe_payment_intent_id,
        });
      }
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
