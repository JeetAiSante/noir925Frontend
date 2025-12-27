import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export const useSoldProductsAutomation = () => {
  const queryClient = useQueryClient();

  // Fetch products with 0 stock that are still active
  const { data: outOfStockProducts } = useQuery({
    queryKey: ['out-of-stock-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, stock_quantity, is_active')
        .eq('stock_quantity', 0)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Check every minute
  });

  // Fetch sold products that need to be removed
  const { data: soldProducts } = useQuery({
    queryKey: ['sold-products-to-remove'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sold_products')
        .select('*')
        .eq('is_removed', false)
        .lt('remove_after', new Date().toISOString());
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
  });

  // Mark product as sold (add to sold_products table)
  const markAsSold = useMutation({
    mutationFn: async (product: { id: string; name: string; slug: string }) => {
      // Check if already in sold_products
      const { data: existing } = await supabase
        .from('sold_products')
        .select('id')
        .eq('product_id', product.id)
        .single();

      if (!existing) {
        const { error } = await supabase
          .from('sold_products')
          .insert({
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            sold_at: new Date().toISOString(),
            remove_after: subDays(new Date(), -7).toISOString(), // 7 days from now
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sold-products-to-remove'] });
    },
  });

  // Remove product (deactivate after 7 days)
  const removeProduct = useMutation({
    mutationFn: async (soldProduct: { id: string; product_id: string }) => {
      // Deactivate the product
      const { error: productError } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', soldProduct.product_id);
      if (productError) throw productError;

      // Mark as removed in sold_products
      const { error: soldError } = await supabase
        .from('sold_products')
        .update({ is_removed: true })
        .eq('id', soldProduct.id);
      if (soldError) throw soldError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['db-products'] });
      queryClient.invalidateQueries({ queryKey: ['sold-products-to-remove'] });
    },
  });

  // Automation effect
  useEffect(() => {
    // Mark out of stock products as sold
    if (outOfStockProducts && outOfStockProducts.length > 0) {
      outOfStockProducts.forEach((product) => {
        markAsSold.mutate({
          id: product.id,
          name: product.name,
          slug: product.slug,
        });
      });
    }
  }, [outOfStockProducts]);

  useEffect(() => {
    // Remove products after 7 days
    if (soldProducts && soldProducts.length > 0) {
      soldProducts.forEach((soldProduct) => {
        removeProduct.mutate({
          id: soldProduct.id,
          product_id: soldProduct.product_id,
        });
      });
    }
  }, [soldProducts]);

  return {
    outOfStockProducts,
    soldProducts,
    markAsSold,
    removeProduct,
  };
};