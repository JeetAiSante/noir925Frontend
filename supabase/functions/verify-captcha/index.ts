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
    const { token } = await req.json();
    console.log('Verifying hCaptcha token...');

    if (!token) {
      console.error('No captcha token provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No captcha token provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secretKey = Deno.env.get('HCAPTCHA_SECRET_KEY');
    if (!secretKey) {
      console.error('HCAPTCHA_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Captcha verification not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the token with hCaptcha API
    const verifyUrl = 'https://hcaptcha.com/siteverify';
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    console.log('Calling hCaptcha verify API...');
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('hCaptcha verification result:', JSON.stringify(result));

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('hCaptcha verification failed:', result['error-codes']);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Captcha verification failed',
          codes: result['error-codes']
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error verifying captcha:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
