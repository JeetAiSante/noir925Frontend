import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { products as localProducts, categories as localCategories } from '@/data/products';

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  icon: string | null;
  productCount: number;
}

// Fetch categories with real-time product counts from database
export const useCategoriesWithCounts = () => {
  return useQuery({
    queryKey: ['categories-with-counts'],
    queryFn: async (): Promise<CategoryWithCount[]> => {
      // Try to get from database first
      const { data: dbCategories, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug, image_url, icon')
        .eq('is_active', true)
        .order('sort_order');

      if (catError || !dbCategories?.length) {
        // Fallback to local data with dynamic counts
        return localCategories.map(cat => {
          const count = localProducts.filter(
            p => p.category.toLowerCase() === cat.name.toLowerCase()
          ).length;
          return {
            id: cat.id,
            name: cat.name,
            slug: cat.id,
            image_url: cat.image,
            icon: cat.icon,
            productCount: count || cat.count,
          };
        });
      }

      // Get product counts per category from database
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('category_id')
        .eq('is_active', true);

      const countMap: Record<string, number> = {};
      if (products && !prodError) {
        products.forEach(p => {
          if (p.category_id) {
            countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
          }
        });
      }

      return dbCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image_url: cat.image_url,
        icon: cat.icon,
        productCount: countMap[cat.id] || 0,
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Get total product count
export const useTotalProductCount = () => {
  return useQuery({
    queryKey: ['total-product-count'],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error || count === null) {
        return localProducts.length;
      }

      return count;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Get collection counts
export const useCollectionCounts = () => {
  return useQuery({
    queryKey: ['collection-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name, slug, image_url, description, product_ids')
        .eq('is_active', true)
        .order('sort_order');

      if (error || !data?.length) {
        // Fallback with local products
        return [
          { slug: 'bridal-heritage', name: 'Bridal Heritage', count: localProducts.filter(p => p.category === 'Rings' || p.category === 'Necklaces' || p.category === 'Sets').length },
          { slug: 'minimalist', name: 'Minimalist Edit', count: localProducts.filter(p => p.price < 3500).length },
          { slug: 'statement', name: 'Statement Pieces', count: localProducts.filter(p => p.price > 5000 || p.isTrending).length },
          { slug: 'festive', name: 'Festive Luxe', count: localProducts.filter(p => p.isBestseller || p.discount).length },
          { slug: 'everyday', name: 'Everyday Elegance', count: localProducts.filter(p => p.price < 4000).length },
          { slug: 'monsoon', name: 'Monsoon Magic', count: localProducts.length },
        ];
      }

      return data.map(col => ({
        slug: col.slug,
        name: col.name,
        image_url: col.image_url,
        description: col.description,
        count: Array.isArray(col.product_ids) ? col.product_ids.length : 0,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
};
