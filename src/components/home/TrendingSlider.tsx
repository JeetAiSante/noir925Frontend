import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products, formatPrice } from '@/data/products';

const TrendingSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const trendingProducts = products.filter((p) => p.isTrending || p.isBestseller).slice(0, 6);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trendingProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [trendingProducts.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-foreground text-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-accent text-sm text-accent tracking-widest uppercase mb-2">
              What's Hot
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-background">
              Trending Now
            </h2>
          </div>
          <div className="hidden md:flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full text-background hover:bg-background/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full text-background hover:bg-background/10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 3D Slider */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 -mx-4 px-4 perspective-1000"
        >
          {trendingProducts.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className={`group flex-shrink-0 w-[300px] md:w-[350px] transition-all duration-700 ${
                index === activeIndex ? 'scale-105 z-10' : 'scale-95 opacity-80'
              }`}
              data-cursor="product"
            >
              <div className="relative overflow-hidden rounded-2xl bg-background/10 backdrop-blur-sm border border-background/20 p-4">
                {/* Image */}
                <div className="relative overflow-hidden rounded-xl aspect-[4/5] mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Silver reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Sparkle effect */}
                  <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-background animate-sparkle" />
                  <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-accent animate-sparkle delay-300" />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <p className="font-body text-xs text-background/60 uppercase tracking-wider">
                    {product.category}
                  </p>
                  <h3 className="font-display text-xl text-background group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-semibold text-background">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="font-body text-sm text-background/50 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-glow-gold" />
              </div>
            </Link>
          ))}
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {trendingProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === activeIndex
                  ? 'w-12 bg-accent'
                  : 'w-4 bg-background/30 hover:bg-background/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSlider;
