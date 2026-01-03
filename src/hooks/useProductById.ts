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
  dimensions: string | null;
  rating: number | null;
  reviews_count: number | null;
  category_id: string | null;
  hover_image_index: number | null;
  gender: string | null;
  categories?: { name: string; slug: string } | null;
}

const mapDbProductToProduct = (db: DbProduct): Product => {
  const images = Array.isArray(db.images) ? db.images : [];
  const mainImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600';
  const hoverIndex = db.hover_image_index ?? 1;
  const hoverImage = images.length > hoverIndex ? images[hoverIndex] : mainImage;
  
  return {
    id: db.id,
    name: db.name,
    price: db.price,
    originalPrice: db.original_price || undefined,
    discount: db.discount_percent || undefined,
    image: mainImage,
    hoverImage: hoverImage,
    images: images,
    category: db.categories?.name || 'Silver Jewelry',
    rating: db.rating || 4.5,
    reviews: db.reviews_count || 0,
    isNew: db.is_new,
    isBestseller: db.is_bestseller,
    isTrending: db.is_trending,
    description: db.description || '',
    material: db.material || '925 Sterling Silver',
    weight: db.weight || '',
    purity: '92.5% Pure Silver',
    stockQuantity: db.stock_quantity,
  };
};

// Check if string is a valid UUID
const isValidUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const useProductById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      
      // If it's a valid UUID, try fetching by ID first
      if (isValidUUID(id)) {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, name, slug, price, original_price, discount_percent, images, 
            is_new, is_trending, is_bestseller, is_featured, is_active,
            rating, reviews_count, description, short_description,
            material, weight, dimensions, stock_quantity, hover_image_index, gender,
            categories:category_id (name, slug)
          `)
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle();

        if (data) {
          return mapDbProductToProduct(data as DbProduct);
        }
      }
      
      // Try fetching by slug (handles both slug-based URLs and fallback)
      const { data: slugData, error: slugError } = await supabase
        .from('products')
        .select(`
          id, name, slug, price, original_price, discount_percent, images, 
          is_new, is_trending, is_bestseller, is_featured, is_active,
          rating, reviews_count, description, short_description,
          material, weight, dimensions, stock_quantity, hover_image_index, gender,
          categories:category_id (name, slug)
        `)
        .eq('slug', id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (slugData) {
        return mapDbProductToProduct(slugData as DbProduct);
      }
      
      return null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

export const useRelatedProducts = (categoryName: string | undefined, currentProductId: string | undefined, limit = 8) => {
  return useQuery({
    queryKey: ['related-products', categoryName, currentProductId, limit],
    queryFn: async () => {
      if (!categoryName) return [];
      
      // First get category ID
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', categoryName)
        .limit(1);
      
      const categoryId = categories?.[0]?.id;
      
      let query = supabase
        .from('products')
        .select(`
          id, name, slug, price, original_price, discount_percent, images, 
          is_new, is_trending, is_bestseller, rating, reviews_count, 
          description, material, weight, hover_image_index,
          categories:category_id (name, slug)
        `)
        .eq('is_active', true)
        .neq('id', currentProductId || '')
        .limit(limit);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) return [];
      
      return (data as DbProduct[]).map(mapDbProductToProduct);
    },
    enabled: !!categoryName,
    staleTime: 1000 * 60 * 5,
  });
};
