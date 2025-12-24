import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products, formatPrice } from '@/data/products';

const TrendingSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const trendingProducts = products.filter((p) => p.isTrending || p.isBestseller).slice(0, 8);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const cardWidth = 320;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
          setActiveIndex(0);
        } else {
          container.scrollBy({ left: cardWidth, behavior: 'smooth' });
          setActiveIndex((prev) => (prev + 1) % trendingProducts.length);
        }
      }
    }, 3500);
    
    return () => clearInterval(interval);
  }, [isAutoScrolling, trendingProducts.length]);

  // Update active index on scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const cardWidth = 320;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setActiveIndex(Math.min(newIndex, trendingProducts.length - 1));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [trendingProducts.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      setIsAutoScrolling(false);
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      // Resume auto-scroll after 5 seconds
      setTimeout(() => setIsAutoScrolling(true), 5000);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      setIsAutoScrolling(false);
      const cardWidth = 320;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
      setActiveIndex(index);
      setTimeout(() => setIsAutoScrolling(true), 5000);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-foreground text-background relative overflow-hidden">
      {/* Shimmer background effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-accent animate-pulse" />
              <p className="font-accent text-xs text-accent tracking-widest uppercase">
                What's Hot
              </p>
            </div>
            <h2 className="font-display text-2xl md:text-4xl text-background">
              Trending Now
            </h2>
          </div>
          <div className="hidden md:flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full text-background hover:bg-background/10 w-9 h-9"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full text-background hover:bg-background/10 w-9 h-9"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          onMouseEnter={() => setIsAutoScrolling(false)}
          onMouseLeave={() => setIsAutoScrolling(true)}
        >
          {trendingProducts.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group flex-shrink-0 w-[280px] md:w-[300px] snap-start transition-all duration-500"
            >
              <div className={`relative overflow-hidden rounded-xl bg-background/10 backdrop-blur-sm border border-background/20 p-3 transition-all duration-500 ${
                index === activeIndex ? 'scale-[1.02] shadow-xl shadow-accent/20' : 'hover:scale-[1.01]'
              }`}>
                {/* Badge */}
                {product.discount && (
                  <div className="absolute top-4 left-4 z-10 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                    -{product.discount}%
                  </div>
                )}
                
                {/* Image */}
                <div className="relative overflow-hidden rounded-lg aspect-[4/5] mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Shimmer overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-background/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Sparkle effects */}
                  <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-background/80 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-accent/80 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <p className="font-body text-[10px] text-background/60 uppercase tracking-wider">
                    {product.category}
                  </p>
                  <h3 className="font-display text-lg text-background group-hover:text-accent transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-semibold text-background">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="font-body text-sm text-background/50 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Glow effect on active */}
                {index === activeIndex && (
                  <div className="absolute inset-0 rounded-xl opacity-30 pointer-events-none border-2 border-accent animate-pulse" />
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {trendingProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === activeIndex
                  ? 'w-8 bg-accent'
                  : 'w-2 bg-background/30 hover:bg-background/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSlider;