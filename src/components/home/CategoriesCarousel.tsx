import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { categories } from '@/data/products';

const CategoriesCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-accent text-sm text-primary tracking-widest uppercase mb-2">Browse</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">Shop by Category</h2>
          </div>
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className="group flex-shrink-0 w-[160px] md:w-[200px]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden rounded-2xl aspect-square mb-4 bg-muted" data-cursor="card">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Bloom effect on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 rounded-full bg-secondary/30 animate-bloom" />
                </div>

                {/* Count badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-full">
                  <span className="font-body text-xs text-foreground">{category.count}</span>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {category.count} Pieces
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile scroll indicator */}
        <div className="flex justify-center gap-1 mt-6 md:hidden">
          {categories.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-border"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesCarousel;
