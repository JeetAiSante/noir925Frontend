import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const allowedOrigins = [
  'https://noir925.com',
  'https://www.noir925.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && (allowedOrigins.includes(origin) || origin.includes('lovable.app') || origin.includes('lovableproject.com'));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
};

// Validate email addresses to prevent abuse
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
};

// Sanitize text content for HTML injection prevention
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

const sendEmail = async (payload: { from: string; to: string[]; subject: string; html: string }) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const error = await res.text();
    console.error("Resend API error:", error);
    throw new Error("Email delivery failed");
  }
  
  return await res.json();
};

// Base email template with company branding
const getEmailTemplate = (content: string, companyName?: string, companyLogo?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      ${companyLogo ? `<img src="${companyLogo}" alt="${companyName || 'NOIR925'}" style="max-height: 50px; margin-bottom: 15px;" />` : ''}
      <h1 style="color: #D4AF37; font-size: 28px; letter-spacing: 2px; margin: 0;">${companyName || 'NOIR925'}</h1>
      <p style="color: #888; font-size: 12px; margin-top: 5px;">Premium 925 Sterling Silver Jewellery</p>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      ${content}
    </div>
    <div style="text-align: center; padding: 20px; color: #888; font-size: 11px;">
      <p>© ${new Date().getFullYear()} ${companyName || 'NOIR925'}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

// Order Confirmation Email
const getOrderConfirmationContent = (data: any) => `
  <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; text-align: center;">🎉 Order Confirmed!</h2>
  
  <p style="color: #666; line-height: 1.6;">Dear ${data.customerName},</p>
  <p style="color: #666; line-height: 1.6; margin-top: 10px;">
    Thank you for your order! We're thrilled to have you as our customer.
  </p>
  
  <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 25px 0;">
    <table style="width: 100%;">
      <tr>
        <td style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 5px;">Order Number</td>
        <td style="text-align: right; color: #D4AF37; font-weight: bold; font-size: 16px;">#${data.orderNumber}</td>
      </tr>
      <tr>
        <td style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding-top: 10px;">Order Total</td>
        <td style="text-align: right; color: #333; font-weight: bold; font-size: 20px;">₹${data.total?.toLocaleString('en-IN')}</td>
      </tr>
    </table>
  </div>
  
  <p style="color: #666; line-height: 1.6;">
    We'll send you another email when your order ships with tracking information.
  </p>
  
  <div style="text-align: center; margin-top: 30px;">
    <a href="https://noir925.com/track-order?order=${data.orderNumber}" 
       style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #8B7355 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">
      Track Your Order
    </a>
  </div>
  
  ${data.companySignature ? `
    <div style="margin-top: 30px; text-align: right; border-top: 1px solid #eee; padding-top: 20px;">
      <img src="${data.companySignature}" alt="Signature" style="max-height: 40px;" />
      <p style="font-size: 11px; color: #888; margin-top: 5px;">Authorized Signature</p>
    </div>
  ` : ''}
`;

// Shipping Update Email
const getShippingUpdateContent = (data: any) => `
  <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; text-align: center;">📦 Your Order Has Shipped!</h2>
  
  <p style="color: #666; line-height: 1.6;">Dear ${data.customerName},</p>
  <p style="color: #666; line-height: 1.6; margin-top: 10px;">
    Great news! Your order <strong style="color: #D4AF37;">#${data.orderNumber}</strong> is on its way to you.
  </p>
  
  <div style="background: linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 100%); padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
    <p style="color: #9333ea; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Current Status</p>
    <span style="display: inline-block; padding: 10px 25px; background: #9333ea; color: white; border-radius: 25px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
      SHIPPED
    </span>
  </div>
  
  ${data.trackingNumber ? `
    <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0;">
      <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Tracking Number</p>
      <p style="color: #333; font-size: 16px; font-weight: bold;">${data.trackingNumber}</p>
    </div>
  ` : ''}
  
  <p style="color: #666; line-height: 1.6;">
    Your package is expected to arrive within 3-5 business days. We'll keep you updated on the delivery progress.
  </p>
  
  <div style="text-align: center; margin-top: 30px;">
    <a href="https://noir925.com/track-order?order=${data.orderNumber}" 
       style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">
      Track Shipment
    </a>
  </div>
  
  ${data.companySignature ? `
    <div style="margin-top: 30px; text-align: right; border-top: 1px solid #eee; padding-top: 20px;">
      <img src="${data.companySignature}" alt="Signature" style="max-height: 40px;" />
    </div>
  ` : ''}
`;

// Delivery Notification Email
const getDeliveryNotificationContent = (data: any) => `
  <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; text-align: center;">✅ Order Delivered!</h2>
  
  <p style="color: #666; line-height: 1.6;">Dear ${data.customerName},</p>
  <p style="color: #666; line-height: 1.6; margin-top: 10px;">
    Your order <strong style="color: #D4AF37;">#${data.orderNumber}</strong> has been delivered successfully!
  </p>
  
  <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
    <p style="color: #16a34a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Current Status</p>
    <span style="display: inline-block; padding: 10px 25px; background: #16a34a; color: white; border-radius: 25px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
      DELIVERED
    </span>
  </div>
  
  <p style="color: #666; line-height: 1.6;">
    We hope you love your new jewellery! If you have any questions or concerns, please don't hesitate to reach out.
  </p>
  
  <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
    <p style="color: #888; font-size: 12px; margin-bottom: 10px;">How was your experience?</p>
    <p style="font-size: 24px;">⭐⭐⭐⭐⭐</p>
    <a href="https://noir925.com/review/${data.orderNumber}" 
       style="display: inline-block; color: #D4AF37; text-decoration: none; font-size: 12px; margin-top: 10px;">
      Leave a Review →
    </a>
  </div>
  
  ${data.companySignature ? `
    <div style="margin-top: 30px; text-align: right; border-top: 1px solid #eee; padding-top: 20px;">
      <img src="${data.companySignature}" alt="Signature" style="max-height: 40px;" />
      <p style="font-size: 11px; color: #888; margin-top: 5px;">Thank you for shopping with us!</p>
    </div>
  ` : ''}
`;

// Order Status Update Email
const getOrderStatusContent = (data: any) => `
  <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">Order Status Update</h2>
  
  <p style="color: #666; line-height: 1.6;">Dear ${data.customerName},</p>
  <p style="color: #666; line-height: 1.6; margin-top: 10px;">
    Your order <strong style="color: #D4AF37;">#${data.orderNumber}</strong> has been updated.
  </p>
  
  <div style="background: linear-gradient(135deg, #f9f9f9 0%, #f5f5f5 100%); padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
    <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Current Status</p>
    <span style="display: inline-block; padding: 10px 25px; border-radius: 25px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
      ${data.status === 'pending' ? 'background: #fef3c7; color: #d97706;' : ''}
      ${data.status === 'processing' ? 'background: #dbeafe; color: #2563eb;' : ''}
      ${data.status === 'shipped' ? 'background: #e9d5ff; color: #9333ea;' : ''}
      ${data.status === 'delivered' ? 'background: #dcfce7; color: #16a34a;' : ''}
      ${data.status === 'cancelled' ? 'background: #fee2e2; color: #dc2626;' : ''}
    ">${data.status}</span>
  </div>
  
  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #888;">Order Total:</span>
      <span style="font-size: 20px; font-weight: bold; color: #D4AF37;">₹${data.total?.toLocaleString('en-IN')}</span>
    </div>
  </div>
  
  <div style="margin-top: 30px; text-align: center;">
    <a href="https://noir925.com/track-order?order=${data.orderNumber}" 
       style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #8B7355 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">
      Track Your Order
    </a>
  </div>
  
  ${data.companySignature ? `
    <div style="margin-top: 30px; text-align: right; border-top: 1px solid #eee; padding-top: 20px;">
      <img src="${data.companySignature}" alt="Signature" style="max-height: 40px;" />
    </div>
  ` : ''}
`;

// Contact Form Email - with sanitized inputs
const getContactEmailHtml = (name: string, email: string, subject: string, message: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a1a1a; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
    <h1 style="color: #c9a050; margin: 0;">NOIR925</h1>
    <p style="color: #999; margin: 5px 0 0;">New Contact Form Submission</p>
  </div>
  <div style="background: #f9f9f9; padding: 20px; border-radius: 12px;">
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
  </div>
</body>
</html>`;

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const { type, data } = await req.json();
    console.log("Processing email type:", type);

    const fromEmail = "NOIR925 <onboarding@resend.dev>";

    // Contact form is public but requires validation
    if (type === 'contact') {
      // Validate contact form inputs
      if (!data.name || !data.email || !data.subject || !data.message) {
        throw new Error('Missing required fields');
      }
      if (!isValidEmail(data.email)) {
        throw new Error('Invalid email address');
      }
      // Length limits
      if (data.name.length > 100 || data.subject.length > 200 || data.message.length > 5000) {
        throw new Error('Input exceeds maximum length');
      }
      
      await sendEmail({
        from: fromEmail,
        to: ["hello@noir925.com"],
        subject: `New Contact: ${data.subject.substring(0, 100)}`,
        html: getContactEmailHtml(data.name, data.email, data.subject, data.message),
      });
      console.log("Contact email sent successfully");
    } else {
      // All other email types require authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
      }

      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        throw new Error('Invalid token');
      }

      // Validate email recipients
      const targetEmail = data.to || data.customerEmail;
      if (targetEmail && !isValidEmail(targetEmail)) {
        throw new Error('Invalid recipient email');
      }
      
      if (type === 'order_confirmation') {
        const content = getOrderConfirmationContent(data);
        await sendEmail({
          from: fromEmail,
          to: [data.customerEmail],
          subject: `Order Confirmed - #${data.orderNumber}`,
          html: getEmailTemplate(content, data.companyName, data.companyLogo),
        });
        console.log("Order confirmation email sent successfully");
      } else if (type === 'shipping_update') {
        const content = getShippingUpdateContent(data);
        await sendEmail({
          from: fromEmail,
          to: [data.to],
          subject: `Your Order #${data.orderNumber} Has Shipped!`,
          html: getEmailTemplate(content, data.companyName, data.companyLogo),
        });
        console.log("Shipping update email sent successfully");
      } else if (type === 'delivery_notification') {
        const content = getDeliveryNotificationContent(data);
        await sendEmail({
          from: fromEmail,
          to: [data.to],
          subject: `Order #${data.orderNumber} Delivered Successfully!`,
          html: getEmailTemplate(content, data.companyName, data.companyLogo),
        });
        console.log("Delivery notification email sent successfully");
      } else if (type === 'order_status') {
        const content = getOrderStatusContent(data);
        await sendEmail({
          from: fromEmail,
          to: [data.to],
          subject: `Order #${data.orderNumber} - Status Update: ${data.status.toUpperCase()}`,
          html: getEmailTemplate(content, data.companyName, data.companyLogo),
        });
        console.log("Order status email sent successfully");
      } else if (type === 'invoice') {
        await sendEmail({
          from: fromEmail,
          to: [data.to],
          subject: data.subject,
          html: data.html,
        });
        console.log("Invoice email sent successfully");
      } else if (type === 'generic') {
        await sendEmail({
          from: fromEmail,
          to: [data.to],
          subject: data.subject,
          html: data.html,
        });
        console.log("Generic email sent successfully");
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    const corsHeaders = getCorsHeaders(req.headers.get("origin"));
    console.error("Email function error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: "An error occurred while sending the email. Please try again later." 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);