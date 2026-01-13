import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useProducts } from '@/hooks/useProducts';
import { useHomepageSections } from '@/hooks/useHomepageSections';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

const TrendingSlider = () => {
  const { formatPrice } = useCurrency();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const animationRef = useRef<number>();

  const { data: dbProducts = [] } = useProducts({ trending: true, limit: 12 });
  const { data: dbBestsellers = [] } = useProducts({ bestseller: true, limit: 12 });
  
  const { getSectionSettings } = useHomepageSections();
  const sectionSettings = getSectionSettings('trending');
  
  const trendingProducts = [...dbProducts, ...dbBestsellers]
    .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
    .slice(0, 12);
  
  const displayProducts = [...trendingProducts, ...trendingProducts];

  // Check scroll position for arrow visibility
  const checkScrollPosition = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollLeft > 10);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
  }, []);

  // Manual scroll navigation
  const scrollByAmount = useCallback((direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  }, []);

  // Swipe gesture support
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => scrollByAmount('right'),
    onSwipeRight: () => scrollByAmount('left'),
    threshold: 50,
  });

  // Smooth continuous scroll animation
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollPosition = container.scrollLeft || 0;
    let targetSpeed = 0.4;
    let currentSpeed = 0.4;

    const animate = () => {
      if (container) {
        const desiredSpeed = isPaused ? 0 : targetSpeed;
        currentSpeed += (desiredSpeed - currentSpeed) * 0.05;
        
        if (Math.abs(currentSpeed) > 0.01) {
          scrollPosition += currentSpeed;
          
          const halfWidth = container.scrollWidth / 2;
          if (scrollPosition >= halfWidth) {
            scrollPosition = 0;
          }
          
          container.scrollLeft = scrollPosition;
        }
        
        checkScrollPosition();
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, checkScrollPosition]);

  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Luxury Background */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop" 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/95 via-foreground/90 to-foreground/95" />
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-accent/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Flame className="w-4 h-4 text-accent animate-pulse" />
            <span className="font-accent text-xs text-accent tracking-widest uppercase">
              {sectionSettings?.customSubtitle || "What's Hot Right Now"}
            </span>
            <Flame className="w-4 h-4 text-accent animate-pulse" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-background mb-3">
            {sectionSettings?.customTitle || 'Trending Now'}
          </h2>
          <p className="text-background/60 max-w-md mx-auto text-sm md:text-base">
            Discover our most loved pieces that everyone's talking about
          </p>
        </div>

        {/* Carousel Container with Navigation */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scrollByAmount('left')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-background/90 backdrop-blur-md border border-border/50 shadow-xl transition-all duration-300 ${
              canScrollLeft 
                ? 'opacity-0 group-hover:opacity-100 hover:scale-110' 
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollByAmount('right')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-background/90 backdrop-blur-md border border-border/50 shadow-xl transition-all duration-300 ${
              canScrollRight 
                ? 'opacity-0 group-hover:opacity-100 hover:scale-110' 
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-hidden scroll-smooth"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            {...swipeHandlers}
          >
            {displayProducts.map((product, index) => (
              <Link
                key={`${product.id}-${index}`}
                to={`/product/${product.slug || product.id}`}
                className="group/card flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px]"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-background/10 to-background/5 backdrop-blur-sm border border-background/10 p-3 transition-all duration-500 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/10">
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                    {product.discount && (
                      <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full">
                        -{product.discount}%
                      </span>
                    )}
                    {product.isNew && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-xl aspect-square mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                      <span className="px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full text-foreground text-xs font-medium transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                        Quick View
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <p className="font-body text-[9px] text-background/50 uppercase tracking-widest">
                      {product.category}
                    </p>
                    <h3 className="font-display text-sm md:text-base text-background group-hover/card:text-accent transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating)
                              ? 'fill-accent text-accent'
                              : 'text-background/20'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-background/40 ml-1">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-semibold text-background">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="font-body text-xs text-background/40 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="h-1 w-20 rounded-full bg-background/20 overflow-hidden">
            <div className="h-full w-full bg-accent rounded-full animate-scroll-indicator" />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link 
            to="/shop?sort=trending" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground rounded-full font-medium text-sm transition-all duration-300 border border-accent/30"
          >
            View All Trending
            <Flame className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes scroll-indicator {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scroll-indicator {
          animation: scroll-indicator 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default TrendingSlider;
