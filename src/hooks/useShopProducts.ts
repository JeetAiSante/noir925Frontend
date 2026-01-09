import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { products as localProducts } from '@/data/products';
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
  gender: string | null;
  hover_image_index: number | null;
  category?: { name: string; slug: string } | null;
}

const mapDbProductToProduct = (db: DbProduct): Product => {
  const images = Array.isArray(db.images) ? db.images : [];
  const mainImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600';
  const hoverIndex = db.hover_image_index ?? 1;
  const hoverImage = images.length > hoverIndex ? images[hoverIndex] : mainImage;
  
  return {
    id: db.id,
    slug: db.slug,
    name: db.name,
    price: db.price,
    originalPrice: db.original_price || undefined,
    discount: db.discount_percent || undefined,
    image: mainImage,
    hoverImage: hoverImage,
    images: images,
    category: db.category?.name || 'Silver Jewelry',
    rating: db.rating || 4.5,
    reviews: db.reviews_count || 0,
    isNew: db.is_new,
    isBestseller: db.is_bestseller,
    isTrending: db.is_trending,
    description: db.description || '',
    material: db.material || '925 Sterling Silver',
    weight: db.weight || '',
    purity: '92.5% Pure Silver',
  };
};

interface UseShopProductsOptions {
  category?: string | null;
  gender?: string | null;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
}

export const useShopProducts = (options: UseShopProductsOptions = {}) => {
  return useQuery({
    queryKey: ['shop-products', options],
    queryFn: async (): Promise<Product[]> => {
      try {
        let query = supabase
          .from('products')
          .select(`
            id, name, slug, price, original_price, discount_percent, images, 
            is_new, is_trending, is_bestseller, is_featured, rating, reviews_count, 
            description, material, weight, hover_image_index, category_id, gender,
            category:categories(name, slug)
          `)
          .eq('is_active', true);

        // Filter by category (using category slug)
        if (options.category) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', options.category)
            .maybeSingle();
          
          if (!categoryError && categoryData?.id) {
            query = query.eq('category_id', categoryData.id);
          }
        }

        // Filter by gender
        if (options.gender) {
          query = query.eq('gender', options.gender);
        }

        // Filter by price range
        if (options.minPrice !== undefined && options.minPrice > 0) {
          query = query.gte('price', options.minPrice);
        }
        if (options.maxPrice !== undefined && options.maxPrice < 20000) {
          query = query.lte('price', options.maxPrice);
        }

        // Filter by minimum rating
        if (options.minRating !== undefined && options.minRating > 0) {
          query = query.gte('rating', options.minRating);
        }

        // Apply sorting
        switch (options.sortBy) {
          case 'price-low':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'rating':
            query = query.order('rating', { ascending: false, nullsFirst: false });
            break;
          default:
            query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          // Fallback to local products with filters
          return filterLocalProducts(localProducts, options);
        }

        return (data as DbProduct[]).map(mapDbProductToProduct);
      } catch (error) {
        console.error('Error in useShopProducts:', error);
        // Fallback to local products
        return filterLocalProducts(localProducts, options);
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Helper function to filter local products when DB is not available
const filterLocalProducts = (products: Product[], options: UseShopProductsOptions): Product[] => {
  let result = [...products];

  // Filter by category
  if (options.category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === options.category?.toLowerCase()
    );
  }

  // Filter by price
  if (options.minPrice !== undefined && options.minPrice > 0) {
    result = result.filter((p) => p.price >= options.minPrice!);
  }
  if (options.maxPrice !== undefined && options.maxPrice < 20000) {
    result = result.filter((p) => p.price <= options.maxPrice!);
  }

  // Filter by rating
  if (options.minRating !== undefined && options.minRating > 0) {
    result = result.filter((p) => p.rating >= options.minRating!);
  }

  // Sort
  switch (options.sortBy) {
    case 'price-low':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
  }

  return result;
};

// Get products count by gender
export const useGenderProductCounts = () => {
  return useQuery({
    queryKey: ['gender-product-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('gender')
        .eq('is_active', true);

      if (error || !data) {
        return { men: 0, women: 0 };
      }

      const menCount = data.filter(p => p.gender === 'men').length;
      const womenCount = data.filter(p => p.gender === 'women').length;

      return { men: menCount, women: womenCount };
    },
    staleTime: 1000 * 60 * 5,
  });
};
