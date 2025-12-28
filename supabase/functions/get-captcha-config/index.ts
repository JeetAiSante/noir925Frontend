import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const siteKey = Deno.env.get('HCAPTCHA_SITE_KEY');
    
    if (!siteKey) {
      console.log('HCAPTCHA_SITE_KEY not configured, using test key');
      // Return test site key for development
      return new Response(
        JSON.stringify({ siteKey: '10000000-ffff-ffff-ffff-000000000001' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ siteKey }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting captcha config:', error);
    return new Response(
      JSON.stringify({ siteKey: '10000000-ffff-ffff-ffff-000000000001' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
