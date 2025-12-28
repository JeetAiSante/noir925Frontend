import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp, Star, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/context/CurrencyContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
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

const ProductSpotlightPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { formatPrice } = useCurrency();
  const isMobile = useIsMobile();

  // Fetch popup settings
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
  });

  // Fetch feature toggle
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
  });

  // Fetch products based on settings
  const { data: products = [] } = useQuery({
    queryKey: ['spotlight-products', settings],
    queryFn: async () => {
      if (!settings) return [];

      let query = supabase
        .from('products')
        .select('id, name, slug, price, original_price, images, is_new, is_trending, is_bestseller, is_featured, rating')
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

  if (!settings?.is_enabled || !featureToggle?.is_enabled || products.length === 0) {
    return null;
  }

  const product = products[currentIndex];
  const imageUrl = Array.isArray(product?.images) && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400';

  const discount = product?.original_price && product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  // Position classes based on settings
  const getPositionClasses = () => {
    if (isMobile) {
      return 'bottom-20 left-4 right-4';
    }
    switch (settings.position) {
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom':
        return 'bottom-6 left-1/2 -translate-x-1/2';
      default:
        return 'bottom-6 right-6';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && product && (
        <motion.div
          className={`fixed z-50 ${getPositionClasses()}`}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div 
            className="relative bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
            style={{ 
              maxWidth: isMobile ? '100%' : '360px',
              minWidth: isMobile ? 'auto' : '320px'
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              aria-label="Close popup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="font-accent text-xs tracking-widest uppercase text-primary">
                  {settings.title || 'Trending Now'}
                </span>
              </div>
              {settings.subtitle && (
                <p className="text-xs text-muted-foreground">{settings.subtitle}</p>
              )}
            </div>

            {/* Product Card */}
            <Link 
              to={`/product/${product.slug}`} 
              onClick={handleClose}
              className="block group"
            >
              <div className="relative aspect-square mx-4 rounded-xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.is_new && (
                    <Badge className="bg-green-500 text-white text-[10px] px-2 py-0.5">
                      NEW
                    </Badge>
                  )}
                  {product.is_trending && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      HOT
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white text-[10px] px-2 py-0.5">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                {product.rating && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Navigation & CTA */}
            <div className="px-4 pb-4 flex items-center justify-between">
              {products.length > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevProduct}
                    className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {currentIndex + 1} / {products.length}
                  </span>
                  <button
                    onClick={nextProduct}
                    className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                    aria-label="Next product"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div />
              )}
              
              <Link to={`/product/${product.slug}`} onClick={handleClose}>
                <Button size="sm" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductSpotlightPopup;
