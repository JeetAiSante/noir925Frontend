import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting sold products processing...');

    // Step 1: Find products with 0 stock that aren't already in sold_products
    const { data: outOfStockProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, slug')
      .eq('stock_quantity', 0)
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching out of stock products:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${outOfStockProducts?.length || 0} out of stock products`);

    // Step 2: Check which products are already in sold_products
    const productIds = outOfStockProducts?.map(p => p.id) || [];
    
    if (productIds.length > 0) {
      const { data: existingSold, error: existingError } = await supabase
        .from('sold_products')
        .select('product_id')
        .in('product_id', productIds)
        .eq('is_removed', false);

      if (existingError) {
        console.error('Error checking existing sold products:', existingError);
      }

      const existingProductIds = new Set(existingSold?.map(s => s.product_id) || []);
      
      // Step 3: Add new products to sold_products table
      const newSoldProducts = outOfStockProducts
        ?.filter(p => !existingProductIds.has(p.id))
        .map(product => ({
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          sold_at: new Date().toISOString(),
          remove_after: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_removed: false
        }));

      if (newSoldProducts && newSoldProducts.length > 0) {
        const { error: insertError } = await supabase
          .from('sold_products')
          .insert(newSoldProducts);

        if (insertError) {
          console.error('Error inserting sold products:', insertError);
        } else {
          console.log(`Added ${newSoldProducts.length} products to sold_products table`);
        }
      }
    }

    // Step 4: Mark products for removal after 1 week and deactivate them
    const now = new Date().toISOString();
    
    const { data: productsToRemove, error: removeQueryError } = await supabase
      .from('sold_products')
      .select('product_id, product_name')
      .eq('is_removed', false)
      .lt('remove_after', now);

    if (removeQueryError) {
      console.error('Error querying products to remove:', removeQueryError);
    }

    if (productsToRemove && productsToRemove.length > 0) {
      console.log(`Found ${productsToRemove.length} products to remove from display`);
      
      const productIdsToRemove = productsToRemove.map(p => p.product_id);

      // Deactivate the products
      const { error: deactivateError } = await supabase
        .from('products')
        .update({ is_active: false })
        .in('id', productIdsToRemove);

      if (deactivateError) {
        console.error('Error deactivating products:', deactivateError);
      } else {
        console.log(`Deactivated ${productIdsToRemove.length} products`);
      }

      // Mark as removed in sold_products table
      const { error: markRemovedError } = await supabase
        .from('sold_products')
        .update({ is_removed: true })
        .in('product_id', productIdsToRemove);

      if (markRemovedError) {
        console.error('Error marking products as removed:', markRemovedError);
      } else {
        console.log(`Marked ${productIdsToRemove.length} products as removed`);
      }
    }

    const summary = {
      timestamp: now,
      outOfStockFound: outOfStockProducts?.length || 0,
      productsRemoved: productsToRemove?.length || 0,
      status: 'success'
    };

    console.log('Sold products processing complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in process-sold-products:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      status: 'error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});