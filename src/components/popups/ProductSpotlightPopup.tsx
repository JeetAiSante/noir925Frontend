import { useState, useEffect, useCallback, memo } from 'react';
import { X, Sparkles, TrendingUp, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/context/CurrencyContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

interface ProductPopupSettings {
  id: string;
  is_enabled: boolean;
  title: string;
  subtitle: string | null;
  theme_image: string | null;
  position: string;
  display_duration: number;
  show_on_pages: string[];
  auto_popup_delay: number;
  max_products: number;
  show_trending: boolean;
  show_new: boolean;
  show_bestseller: boolean;
  show_featured: boolean;
  selected_product_ids: string[];
  background_color: string;
  accent_color: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  images: string[];
  is_new: boolean;
  is_trending: boolean;
  is_bestseller: boolean;
  is_featured: boolean;
  rating: number;
}

const ProductSpotlightPopup = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { formatPrice } = useCurrency();
  const isMobile = useIsMobile();

  // Fetch popup settings with stale time to reduce requests
  const { data: settings } = useQuery({
    queryKey: ['product-popup-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_popup_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as ProductPopupSettings | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  // Fetch feature toggle with stale time
  const { data: featureToggle } = useQuery({
    queryKey: ['feature-toggle-product-popup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('is_enabled')
        .eq('feature_key', 'product_popup')
        .single();
      
      if (error && error.code !== 'PGRST116') return { is_enabled: false };
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch products based on settings - minimal fields only
  const { data: products = [] } = useQuery({
    queryKey: ['spotlight-products', settings?.id],
    queryFn: async () => {
      if (!settings) return [];

      let query = supabase
        .from('products')
        .select('id, name, slug, price, original_price, images, is_new, is_trending, rating')
        .eq('is_active', true);

      // If specific products are selected, fetch those
      if (settings.selected_product_ids && settings.selected_product_ids.length > 0) {
        query = query.in('id', settings.selected_product_ids);
      } else {
        // Otherwise filter by flags
        const orConditions = [];
        if (settings.show_trending) orConditions.push('is_trending.eq.true');
        if (settings.show_new) orConditions.push('is_new.eq.true');
        if (settings.show_bestseller) orConditions.push('is_bestseller.eq.true');
        if (settings.show_featured) orConditions.push('is_featured.eq.true');
        
        if (orConditions.length > 0) {
          query = query.or(orConditions.join(','));
        }
      }

      const { data, error } = await query.limit(settings.max_products || 4);
      if (error) throw error;
      
      return (data || []) as Product[];
    },
    enabled: !!settings && settings.is_enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Check current page
  const currentPath = window.location.pathname;
  const currentPage = currentPath === '/' ? 'home' : currentPath.split('/')[1] || 'home';

  // Auto show popup after delay
  useEffect(() => {
    if (!settings?.is_enabled || !featureToggle?.is_enabled || hasBeenShown) return;
    if (!settings.show_on_pages?.includes(currentPage)) return;
    if (products.length === 0) return;

    // Check session storage to not show again in same session
    const shown = sessionStorage.getItem('product_spotlight_shown');
    if (shown) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasBeenShown(true);
      sessionStorage.setItem('product_spotlight_shown', 'true');
    }, (settings.auto_popup_delay || 5) * 1000);

    return () => clearTimeout(timer);
  }, [settings, featureToggle, hasBeenShown, currentPage, products.length]);

  // Auto hide after duration
  useEffect(() => {
    if (!isVisible || !settings) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, (settings.display_duration || 10) * 1000);

    return () => clearTimeout(timer);
  }, [isVisible, settings]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const nextProduct = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prevProduct = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  if (!settings?.is_enabled || !featureToggle?.is_enabled || products.length === 0 || !isVisible) {
    return null;
  }

  const product = products[currentIndex];
  const imageUrl = Array.isArray(product?.images) && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder.svg';

  const discount = product?.original_price && product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  // Position classes based on settings - compact and mobile optimized
  const getPositionClasses = () => {
    if (isMobile) {
      return 'bottom-20 left-2 right-2';
    }
    switch (settings.position) {
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div
      className={`fixed z-50 ${getPositionClasses()} animate-in slide-in-from-bottom-4 fade-in duration-300`}
    >
      <div 
        className="relative bg-card/98 backdrop-blur-md rounded-xl shadow-xl border border-border/50 overflow-hidden"
        style={{ 
          maxWidth: isMobile ? '100%' : '280px',
          minWidth: isMobile ? 'auto' : '260px'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors"
          aria-label="Close popup"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Compact Header */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="font-accent text-[10px] tracking-widest uppercase text-primary">
              {settings.title || 'Trending'}
            </span>
          </div>
        </div>

        {/* Product Card - Compact */}
        <Link 
          to={`/product/${product.slug}`} 
          onClick={handleClose}
          className="block group"
        >
          <div className="relative aspect-[4/3] mx-3 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            
            {/* Badges - Compact */}
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
              {product.is_new && (
                <Badge className="bg-green-500 text-white text-[9px] px-1.5 py-0 h-4">
                  NEW
                </Badge>
              )}
              {product.is_trending && (
                <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0 h-4 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  HOT
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 h-4">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Rating - Compact */}
            {product.rating && (
              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-background/90 rounded-full px-1.5 py-0.5">
                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-medium">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="px-3 py-2">
            <h4 className="font-medium text-xs line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-semibold text-sm text-primary">{formatPrice(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Navigation - Compact */}
        {products.length > 1 && (
          <div className="px-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={prevProduct}
                className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Previous product"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-muted-foreground px-1">
                {currentIndex + 1}/{products.length}
              </span>
              <button
                onClick={nextProduct}
                className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Next product"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            
            <Link 
              to={`/product/${product.slug}`} 
              onClick={handleClose}
              className="text-[10px] font-medium text-primary hover:underline"
            >
              Shop Now →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
});

ProductSpotlightPopup.displayName = 'ProductSpotlightPopup';

export default ProductSpotlightPopup;
