const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "NOIR925 <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  return response.json();
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  estimatedDelivery: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderData = await req.json();

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

    const itemsHtml = orderData.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-weight: 500; color: #1a1a1a;">${item.name}</span>
          </div>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #D4AF37; font-size: 28px; margin: 0; letter-spacing: 3px;">NOIR925</h1>
            <p style="color: #888888; margin: 10px 0 0; font-size: 14px;">Sterling Silver Jewellery</p>
          </div>
          
          <!-- Success Banner -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 10px;">✓</div>
            <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Order Confirmed!</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Thank you for your purchase, ${orderData.customerName}!</p>
          </div>
          
          <!-- Order Info -->
          <div style="padding: 30px;">
            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="color: #666;">Order Number:</span>
                    <strong style="color: #1a1a1a; margin-left: 10px;">${orderData.orderNumber}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="color: #666;">Order Date:</span>
                    <strong style="color: #1a1a1a; margin-left: 10px;">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="color: #666;">Payment Method:</span>
                    <strong style="color: #1a1a1a; margin-left: 10px;">${orderData.paymentMethod}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;">
                    <span style="color: #666;">Estimated Delivery:</span>
                    <strong style="color: #10b981; margin-left: 10px;">${orderData.estimatedDelivery}</strong>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Order Items -->
            <h3 style="color: #1a1a1a; margin-bottom: 15px; font-size: 16px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px 15px; text-align: left; font-weight: 600; color: #374151;">Product</th>
                <th style="padding: 12px 15px; text-align: center; font-weight: 600; color: #374151;">Qty</th>
                <th style="padding: 12px 15px; text-align: right; font-weight: 600; color: #374151;">Price</th>
              </tr>
              ${itemsHtml}
            </table>
            
            <!-- Order Summary -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Shipping</td>
                  <td style="padding: 8px 0; text-align: right;">${orderData.shipping === 0 ? '<span style="color: #10b981;">FREE</span>' : formatCurrency(orderData.shipping)}</td>
                </tr>
                ${
                  orderData.discount > 0
                    ? `
                <tr>
                  <td style="padding: 8px 0; color: #10b981;">Discount</td>
                  <td style="padding: 8px 0; text-align: right; color: #10b981;">-${formatCurrency(orderData.discount)}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 8px 0; color: #666;">Tax (GST)</td>
                  <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.tax)}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 15px 10px; font-weight: bold; font-size: 18px; color: #1a1a1a;">Total</td>
                  <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #D4AF37;">${formatCurrency(orderData.total)}</td>
                </tr>
              </table>
            </div>
            
            <!-- Shipping Address -->
            <div style="margin-top: 25px; padding: 20px; background: #f9fafb; border-radius: 12px;">
              <h3 style="color: #1a1a1a; margin: 0 0 15px; font-size: 16px;">📦 Shipping Address</h3>
              <p style="margin: 0; color: #374151; line-height: 1.6;">
                ${orderData.customerName}<br>
                ${orderData.shippingAddress.addressLine1}<br>
                ${orderData.shippingAddress.addressLine2 ? orderData.shippingAddress.addressLine2 + "<br>" : ""}
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}<br>
                ${orderData.shippingAddress.country}
              </p>
            </div>
            
            <!-- Track Order Button -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://noir925.lovable.app/track-order?order=${orderData.orderNumber}" 
                 style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8962E 100%); color: #000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Track Your Order
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #1a1a1a; padding: 30px; text-align: center;">
            <p style="color: #D4AF37; margin: 0 0 15px; font-size: 18px; letter-spacing: 2px;">NOIR925</p>
            <p style="color: #888; margin: 0 0 15px; font-size: 13px;">
              Questions? Contact us at support@noir925.com
            </p>
            <p style="color: #555; margin: 20px 0 0; font-size: 11px;">
              © ${new Date().getFullYear()} NOIR925. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Sending order confirmation to ${orderData.customerEmail}`);
    const emailResponse = await sendEmail(
      orderData.customerEmail,
      `Order Confirmed! 🎉 Your NOIR925 Order #${orderData.orderNumber}`,
      emailHtml
    );

    console.log("Order confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
