import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
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

const getContactEmailHtml = (name: string, email: string, subject: string, message: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a1a1a; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
    <h1 style="color: #c9a050; margin: 0;">NOIR925</h1>
    <p style="color: #999; margin: 5px 0 0;">New Contact Form Submission</p>
  </div>
  <div style="background: #f9f9f9; padding: 20px; border-radius: 12px;">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap;">${message}</p>
  </div>
</body>
</html>`;

const getOrderStatusEmailHtml = (data: {
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  companyName?: string;
  companyLogo?: string;
  companySignature?: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      ${data.companyLogo ? `<img src="${data.companyLogo}" alt="${data.companyName || 'NOIR925'}" style="max-height: 50px; margin-bottom: 15px;" />` : ''}
      <h1 style="color: #D4AF37; font-size: 28px; letter-spacing: 2px; margin: 0;">${data.companyName || 'NOIR925'}</h1>
      <p style="color: #888; font-size: 12px; margin-top: 5px;">Premium 925 Sterling Silver Jewellery</p>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
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
          <span style="font-size: 20px; font-weight: bold; color: #D4AF37;">₹${data.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="https://noir925.com/track-order?order=${data.orderNumber}" 
           style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #8B7355 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">
          Track Your Order
        </a>
      </div>
      
      <p style="color: #888; font-size: 13px; line-height: 1.6; margin-top: 30px;">
        Thank you for shopping with ${data.companyName || 'NOIR925'}! If you have any questions, please don't hesitate to contact us.
      </p>
      
      ${data.companySignature ? `
        <div style="margin-top: 30px; text-align: right;">
          <img src="${data.companySignature}" alt="Signature" style="max-height: 40px;" />
          <p style="font-size: 11px; color: #888; margin-top: 5px;">Authorized Signature</p>
        </div>
      ` : ''}
    </div>
    
    <div style="text-align: center; padding: 20px; color: #888; font-size: 11px;">
      <p>© ${new Date().getFullYear()} ${data.companyName || 'NOIR925'}. All rights reserved.</p>
    </div>
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
    const { type, data } = await req.json();
    console.log("Processing email type:", type);

    const fromEmail = "NOIR925 <onboarding@resend.dev>";

    if (type === 'contact') {
      await sendEmail({
        from: fromEmail,
        to: ["hello@noir925.com"],
        subject: `New Contact: ${data.subject}`,
        html: getContactEmailHtml(data.name, data.email, data.subject, data.message),
      });
      console.log("Contact email sent successfully");
    } else if (type === 'order_confirmation') {
      await sendEmail({
        from: fromEmail,
        to: [data.customerEmail],
        subject: `Order Confirmed - ${data.orderNumber}`,
        html: getOrderStatusEmailHtml({
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          status: 'confirmed',
          total: data.total,
          companyName: data.companyName,
          companyLogo: data.companyLogo,
          companySignature: data.companySignature,
        }),
      });
      console.log("Order confirmation email sent successfully");
    } else if (type === 'order_status') {
      await sendEmail({
        from: fromEmail,
        to: [data.to],
        subject: `Order ${data.orderNumber} - Status Update: ${data.status.toUpperCase()}`,
        html: getOrderStatusEmailHtml({
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          status: data.status,
          total: data.total,
          companyName: data.companyName,
          companyLogo: data.companyLogo,
          companySignature: data.companySignature,
        }),
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
      // Generic email for any custom content
      await sendEmail({
        from: fromEmail,
        to: [data.to],
        subject: data.subject,
        html: data.html,
      });
      console.log("Generic email sent successfully");
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