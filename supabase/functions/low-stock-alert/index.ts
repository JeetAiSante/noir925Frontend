import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      from: "NOIR925 Admin <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  return response.json();
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get inventory settings
    const { data: settings } = await supabase
      .from("inventory_settings")
      .select("*")
      .limit(1)
      .single();

    if (!settings || !settings.enable_low_stock_alerts) {
      console.log("Low stock alerts disabled");
      return new Response(JSON.stringify({ message: "Low stock alerts disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get low stock products
    const { data: lowStockProducts } = await supabase
      .from("products")
      .select("id, name, sku, stock_quantity")
      .lte("stock_quantity", settings.low_stock_threshold)
      .gt("stock_quantity", 0)
      .eq("is_active", true);

    // Get out of stock products
    const { data: outOfStockProducts } = await supabase
      .from("products")
      .select("id, name, sku, stock_quantity")
      .eq("stock_quantity", 0)
      .eq("is_active", true);

    // Get critical stock products
    const { data: criticalProducts } = await supabase
      .from("products")
      .select("id, name, sku, stock_quantity")
      .lte("stock_quantity", settings.critical_stock_threshold)
      .gt("stock_quantity", 0)
      .eq("is_active", true);

    const adminEmail = settings.reorder_email || "jeetrathod468@gmail.com";

    if ((lowStockProducts?.length || 0) === 0 && (outOfStockProducts?.length || 0) === 0) {
      console.log("No low stock products found");
      return new Response(JSON.stringify({ message: "No low stock products" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formatProductList = (products: any[], type: string) => {
      if (!products || products.length === 0) return "";
      return `
        <h3 style="color: ${type === "critical" ? "#dc2626" : type === "out" ? "#7c3aed" : "#f59e0b"}; margin-top: 20px;">
          ${type === "critical" ? "🚨 Critical Stock" : type === "out" ? "❌ Out of Stock" : "⚠️ Low Stock"} (${products.length} items)
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr style="background: #f3f4f6;">
            <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Product</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">SKU</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">Stock</th>
          </tr>
          ${products
            .map(
              (p) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${p.name}</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${p.sku || "N/A"}</td>
              <td style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold; color: ${p.stock_quantity === 0 ? "#dc2626" : "#f59e0b"};">
                ${p.stock_quantity}
              </td>
            </tr>
          `
            )
            .join("")}
        </table>
      `;
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); padding: 30px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0;">NOIR925</h1>
          <p style="color: #888; margin: 10px 0 0;">Inventory Alert</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">📦 Stock Level Alert</h2>
          <p style="color: #666;">The following products require your attention:</p>
          
          ${formatProductList(outOfStockProducts || [], "out")}
          ${formatProductList(criticalProducts || [], "critical")}
          ${formatProductList(lowStockProducts || [], "low")}
          
          <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <p style="margin: 0; color: #666;">
              <strong>Current Thresholds:</strong><br>
              Low Stock: ${settings.low_stock_threshold} units<br>
              Critical Stock: ${settings.critical_stock_threshold} units
            </p>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            This is an automated alert from NOIR925 Admin System
          </p>
        </div>
      </div>
    `;

    console.log(`Sending low stock alert to ${adminEmail}`);
    await sendEmail(
      adminEmail,
      `🚨 Inventory Alert: ${(outOfStockProducts?.length || 0) + (criticalProducts?.length || 0) + (lowStockProducts?.length || 0)} Products Need Attention`,
      emailHtml
    );

    return new Response(
      JSON.stringify({
        success: true,
        alertsSent: {
          outOfStock: outOfStockProducts?.length || 0,
          critical: criticalProducts?.length || 0,
          lowStock: lowStockProducts?.length || 0,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending low stock alert:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
