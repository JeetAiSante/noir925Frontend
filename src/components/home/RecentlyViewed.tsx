import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/data/products';

const RecentlyViewed = () => {
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('noir925_recently_viewed');
    if (stored) {
      setViewedIds(JSON.parse(stored));
    }
  }, []);

  // Fetch products from DB by IDs
  const { data: viewedProducts = [] } = useQuery({
    queryKey: ['recently-viewed-products', viewedIds],
    queryFn: async () => {
      if (viewedIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, slug, price, original_price, discount_percent, images,
          is_new, is_trending, is_bestseller, rating, reviews_count,
          description, material, weight, hover_image_index,
          categories:category_id (name, slug)
        `)
        .in('id', viewedIds.slice(0, 4))
        .eq('is_active', true);
      
      if (error) return [];
      
      return (data || []).map((db: any): Product => {
        const images = Array.isArray(db.images) ? db.images : [];
        const mainImage = images[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600';
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
          hoverImage,
          images,
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
        };
      });
    },
    enabled: viewedIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  if (viewedProducts.length === 0 || !isVisible) return null;

  return (
    <section className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-accent text-xs text-muted-foreground tracking-widest uppercase mb-1">
              Continue Exploring
            </p>
            <h3 className="font-display text-xl text-foreground">
              Recently Viewed
            </h3>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('noir925_recently_viewed');
              setViewedIds([]);
              setIsVisible(false);
            }}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Clear recently viewed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {viewedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
