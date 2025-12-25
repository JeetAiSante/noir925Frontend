import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/data/products';

interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  images: string[];
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_trending: boolean;
  is_bestseller: boolean;
  material: string | null;
  weight: string | null;
  rating: number | null;
  reviews_count: number | null;
  category_id: string | null;
}

const mapDbProductToProduct = (db: DbProduct): Product => ({
  id: db.id,
  name: db.name,
  price: db.price,
  originalPrice: db.original_price || undefined,
  discount: db.discount_percent || undefined,
  image: Array.isArray(db.images) && db.images.length > 0 ? db.images[0] : 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
  category: 'Silver Jewelry',
  rating: db.rating || 4.5,
  reviews: db.reviews_count || 0,
  isNew: db.is_new,
  isBestseller: db.is_bestseller,
  isTrending: db.is_trending,
  description: db.description || '',
  material: db.material || '925 Sterling Silver',
  weight: db.weight || '',
  purity: '92.5% Pure Silver',
});

export const useProducts = (options?: { 
  featured?: boolean; 
  new?: boolean; 
  bestseller?: boolean;
  trending?: boolean;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (options?.featured) {
        query = query.eq('is_featured', true);
      }
      if (options?.new) {
        query = query.eq('is_new', true);
      }
      if (options?.bestseller) {
        query = query.eq('is_bestseller', true);
      }
      if (options?.trending) {
        query = query.eq('is_trending', true);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return (data as DbProduct[]).map(mapDbProductToProduct);
    },
    staleTime: 60000,
  });
};

export const useBanners = (position?: string) => {
  return useQuery({
    queryKey: ['banners', position],
    queryFn: async () => {
      let query = supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (position) {
        query = query.eq('position', position);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });
};

export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });
};
