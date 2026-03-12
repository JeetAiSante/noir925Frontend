import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin - MANDATORY
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { campaign_id } = await req.json();

    if (!campaign_id) {
      return new Response(JSON.stringify({ error: 'campaign_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch campaign
    const { data: campaign, error: campError } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();

    if (campError || !campaign) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get recipients based on target audience
    let recipients: string[] = [];

    if (campaign.target_audience === 'newsletter') {
      const { data: subs } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('is_active', true);
      recipients = (subs || []).map(s => s.email);
    } else if (campaign.target_audience === 'customers') {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .not('email', 'is', null);
      recipients = (profiles || []).map(p => p.email!).filter(Boolean);
    } else {
      // 'all' - combine newsletter + registered users
      const { data: subs } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('is_active', true);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .not('email', 'is', null);
      
      const emailSet = new Set<string>();
      (subs || []).forEach(s => emailSet.add(s.email));
      (profiles || []).forEach(p => p.email && emailSet.add(p.email));
      recipients = Array.from(emailSet);
    }

    // Get site contact for branding
    const { data: siteContact } = await supabase
      .from('site_contact')
      .select('company_name, company_logo')
      .limit(1)
      .single();

    const companyName = siteContact?.company_name || 'NOIR925';
    const companyLogo = siteContact?.company_logo || '';

    // Update campaign status
    await supabase
      .from('marketing_campaigns')
      .update({ 
        status: 'sending',
        total_recipients: recipients.length 
      })
      .eq('id', campaign_id);

    let totalSent = 0;

    // Send emails in batches of 10
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const emailHtml = `
        <div style="background:#0a0a0a;padding:40px 0;font-family:'Helvetica Neue',Arial,sans-serif;">
          <div style="max-width:600px;margin:0 auto;background:#141414;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
            <div style="background:linear-gradient(135deg,#1a1a1a,#0a0a0a);padding:30px;text-align:center;border-bottom:1px solid #D4AF37;">
              ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" style="max-height:40px;margin-bottom:12px;" />` : ''}
              <h1 style="color:#D4AF37;font-size:24px;margin:0;letter-spacing:2px;">${companyName}</h1>
            </div>
            <div style="padding:30px;">
              ${campaign.html_content || `<div style="color:#e0e0e0;font-size:15px;line-height:1.7;">${campaign.content || ''}</div>`}
            </div>
            <div style="padding:20px;background:#0a0a0a;text-align:center;border-top:1px solid #2a2a2a;">
              <p style="color:#666;font-size:12px;margin:0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
              <p style="color:#555;font-size:11px;margin:8px 0 0;">You received this because you subscribed to our updates.</p>
            </div>
          </div>
        </div>
      `;

      const promises = batch.map(email =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${companyName} <onboarding@resend.dev>`,
            to: [email],
            subject: campaign.subject || campaign.name,
            html: emailHtml,
          }),
        }).then(res => res.ok ? 1 : 0).catch(() => 0)
      );

      const results = await Promise.all(promises);
      totalSent += results.reduce((sum, r) => sum + r, 0);
    }

    // Update campaign as sent
    await supabase
      .from('marketing_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        total_sent: totalSent,
      })
      .eq('id', campaign_id);

    return new Response(JSON.stringify({ 
      message: `Campaign sent to ${totalSent}/${recipients.length} recipients` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
