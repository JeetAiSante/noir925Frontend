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
    const { adminEmail, loginTime, userAgent, ipAddress } = await req.json();
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      throw new Error('Email service not configured');
    }

    const notifyEmail = 'jeetrathod468@gmail.com';
    const formattedTime = new Date(loginTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; background-color: #f8f6f3; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; }
            .header h1 { color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px; }
            .content { padding: 30px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #d4af37; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
            .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; width: 120px; color: #666; }
            .detail-value { color: #333; }
            .footer { background: #f8f6f3; padding: 20px; text-align: center; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 NOIR925 Admin Alert</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <strong>⚠️ Admin Login Detected</strong>
                <p style="margin: 8px 0 0 0; color: #856404;">Someone has logged into the admin dashboard.</p>
              </div>
              
              <h3 style="color: #1a1a2e; margin-bottom: 15px;">Login Details:</h3>
              
              <div class="detail-row">
                <span class="detail-label">Admin Email:</span>
                <span class="detail-value">${adminEmail}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Login Time:</span>
                <span class="detail-value">${formattedTime}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Browser:</span>
                <span class="detail-value">${userAgent || 'Unknown'}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">IP Address:</span>
                <span class="detail-value">${ipAddress || 'Unknown'}</span>
              </div>
              
              <p style="margin-top: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 14px; color: #666;">
                If this wasn't you, please secure your account immediately by changing your password.
              </p>
            </div>
            <div class="footer">
              <p>This is an automated security notification from NOIR925</p>
              <p>© 2024 NOIR925 - Premium 925 Silver Jewellery</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NOIR925 Security <security@noir925.com>',
        to: [notifyEmail],
        subject: '🔐 Admin Login Alert - NOIR925 Dashboard',
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      throw new Error('Failed to send notification email');
    }

    const data = await response.json();
    console.log('Admin login notification sent:', data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending admin login notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
