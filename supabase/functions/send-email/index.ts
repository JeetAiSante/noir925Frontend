import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    throw new Error(`Failed to send email: ${error}`);
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

const getOrderConfirmationHtml = (orderNumber: string, customerName: string, total: number) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a1a1a; padding: 20px; border-radius: 12px; text-align: center;">
    <h1 style="color: #c9a050; margin: 0;">NOIR925</h1>
    <p style="color: #fff; margin: 10px 0 0;">Order Confirmed!</p>
  </div>
  <div style="padding: 20px;">
    <p>Dear ${customerName},</p>
    <p>Thank you for your order! Your order <strong>${orderNumber}</strong> has been confirmed.</p>
    <p style="font-size: 24px; color: #c9a050;"><strong>Total: ₹${total.toLocaleString()}</strong></p>
    <p>We'll notify you when your order ships.</p>
    <p>Best regards,<br>The NOIR925 Team</p>
  </div>
</body>
</html>`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    console.log("Email type:", type);

    const fromEmail = "NOIR925 <onboarding@resend.dev>";

    if (type === 'contact') {
      await sendEmail({
        from: fromEmail,
        to: ["hello@noir925.com"],
        subject: `New Contact: ${data.subject}`,
        html: getContactEmailHtml(data.name, data.email, data.subject, data.message),
      });
    } else if (type === 'order_confirmation') {
      await sendEmail({
        from: fromEmail,
        to: [data.customerEmail],
        subject: `Order Confirmed - ${data.orderNumber}`,
        html: getOrderConfirmationHtml(data.orderNumber, data.customerName, data.total),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
