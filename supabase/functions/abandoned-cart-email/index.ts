import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const escapeHtml = (text: string | null | undefined): string => {
  if (text == null) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
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

    // Find abandoned carts older than 30 minutes that haven't been emailed
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: abandonedCarts, error: fetchError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('is_recovered', false)
      .eq('email_sent', false)
      .lt('updated_at', thirtyMinutesAgo)
      .gt('cart_total', 0);

    if (fetchError) throw fetchError;

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return new Response(JSON.stringify({ message: 'No abandoned carts to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get site contact for branding
    const { data: siteContact } = await supabase
      .from('site_contact')
      .select('company_name, company_logo, email')
      .limit(1)
      .single();

    const companyName = siteContact?.company_name || 'NOIR925';
    const companyLogo = siteContact?.company_logo || '';
    let emailsSent = 0;

    for (const cart of abandonedCarts) {
      // Get user email from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', cart.user_id)
        .single();

      if (!profile?.email) continue;

      const items = cart.cart_items as any[];
      const itemsHtml = items.map((item: any) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #2a2a2a;">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;" />
          </td>
          <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#e0e0e0;">${escapeHtml(item.name)}</td>
          <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#D4AF37;">₹${Number(item.price).toLocaleString()}</td>
          <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#e0e0e0;">${Number(item.quantity)}</td>
        </tr>
      `).join('');

      const escapedCompanyName = escapeHtml(companyName);
      const escapedFullName = escapeHtml(profile.full_name);

      const emailHtml = `
        <div style="background:#0a0a0a;padding:40px 0;font-family:'Helvetica Neue',Arial,sans-serif;">
          <div style="max-width:600px;margin:0 auto;background:#141414;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
            <div style="background:linear-gradient(135deg,#1a1a1a,#0a0a0a);padding:30px;text-align:center;border-bottom:1px solid #D4AF37;">
              ${companyLogo ? `<img src="${escapeHtml(companyLogo)}" alt="${escapedCompanyName}" style="max-height:40px;margin-bottom:12px;" />` : ''}
              <h1 style="color:#D4AF37;font-size:24px;margin:0;letter-spacing:2px;">${escapedCompanyName}</h1>
            </div>
            <div style="padding:30px;">
              <h2 style="color:#ffffff;font-size:20px;margin:0 0 8px;">You left something behind!</h2>
              <p style="color:#999;font-size:14px;margin:0 0 24px;">Hi ${escapedFullName || 'there'}, your cart is waiting for you.</p>
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:2px solid #D4AF37;">
                    <th style="padding:8px 12px;text-align:left;color:#D4AF37;font-size:12px;text-transform:uppercase;">Image</th>
                    <th style="padding:8px 12px;text-align:left;color:#D4AF37;font-size:12px;text-transform:uppercase;">Product</th>
                    <th style="padding:8px 12px;text-align:left;color:#D4AF37;font-size:12px;text-transform:uppercase;">Price</th>
                    <th style="padding:8px 12px;text-align:left;color:#D4AF37;font-size:12px;text-transform:uppercase;">Qty</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <div style="margin:24px 0;padding:16px;background:#1a1a1a;border-radius:8px;text-align:right;">
                <span style="color:#999;font-size:14px;">Cart Total: </span>
                <span style="color:#D4AF37;font-size:20px;font-weight:bold;">₹${Number(cart.cart_total).toLocaleString()}</span>
              </div>
              <div style="text-align:center;">
                <a href="https://noir925-silver-grace.lovable.app/cart" style="display:inline-block;background:#D4AF37;color:#0a0a0a;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;letter-spacing:1px;text-transform:uppercase;">Complete Your Purchase</a>
              </div>
            </div>
            <div style="padding:20px;background:#0a0a0a;text-align:center;border-top:1px solid #2a2a2a;">
              <p style="color:#666;font-size:12px;margin:0;">© ${new Date().getFullYear()} ${escapedCompanyName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${companyName} <onboarding@resend.dev>`,
          to: [profile.email],
          subject: `${escapedFullName || 'Hey'}, you left items in your cart!`,
          html: emailHtml,
        }),
      });

      if (emailRes.ok) {
        await supabase
          .from('abandoned_carts')
          .update({ email_sent: true, email_sent_at: new Date().toISOString() })
          .eq('id', cart.id);
        emailsSent++;
      }
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${abandonedCarts.length} abandoned carts, sent ${emailsSent} emails` 
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
