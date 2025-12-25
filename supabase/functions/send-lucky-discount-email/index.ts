import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LuckyDiscountEmailRequest {
  email: string;
  customerName: string;
  discountCode: string;
  discountPercent: number;
  luckyNumber: number;
  expiresAt: string;
}

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, customerName, discountCode, discountPercent, luckyNumber, expiresAt }: LuckyDiscountEmailRequest = await req.json();

    console.log(`Sending lucky discount email to ${email}`);

    const emailResponse = await sendEmail({
      from: "NOIR925 <onboarding@resend.dev>",
      to: [email],
      subject: `🍀 You Won ${discountPercent}% Off! Your Lucky Number is ${luckyNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #111; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #D4AF37 0%, #8B7355 100%); padding: 40px; text-align: center; }
            .header h1 { color: #0a0a0a; margin: 0; font-size: 28px; }
            .content { padding: 40px; }
            .lucky-number { font-size: 64px; color: #D4AF37; text-align: center; font-weight: bold; }
            .discount-code { background: #D4AF37; color: #0a0a0a; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .discount-code .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; }
            .discount-code .percent { font-size: 48px; font-weight: bold; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍀 LUCKY DISCOUNT!</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName || 'Valued Customer'},</p>
              <p>Congratulations! Your login time matched our lucky number:</p>
              <div class="lucky-number">${luckyNumber}</div>
              <p style="text-align: center;">You've won an exclusive discount!</p>
              <div class="discount-code">
                <div class="percent">${discountPercent}% OFF</div>
                <div class="code">${discountCode}</div>
              </div>
              <p><strong>How to use:</strong></p>
              <ol>
                <li>Shop your favorite silver jewellery</li>
                <li>Enter code <strong>${discountCode}</strong> at checkout</li>
                <li>Enjoy your lucky discount!</li>
              </ol>
              <p style="color: #999; font-size: 14px;">
                Valid until: ${new Date(expiresAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div class="footer">
              <p>NOIR925 - Crafted in Sterling Silver</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending lucky discount email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
