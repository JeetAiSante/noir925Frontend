import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';

// Calculate real product counts
const getProductCount = (categoryFilter: string) => {
  return products.filter(p => 
    p.category.toLowerCase().includes(categoryFilter.toLowerCase()) ||
    p.subcategory?.toLowerCase().includes(categoryFilter.toLowerCase())
  ).length;
};

const collections = [
  {
    id: 'bridal-heritage',
    name: 'Bridal Heritage',
    description: 'Timeless pieces for your special day',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=600&fit=crop',
    productCount: getProductCount('bridal') || products.filter(p => p.category === 'Rings' || p.category === 'Necklaces').length,
  },
  {
    id: 'floral-bloom',
    name: 'Floral Bloom',
    description: 'Nature-inspired elegance',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop',
    productCount: getProductCount('floral') || 8,
  },
  {
    id: 'everyday-silver',
    name: 'Everyday Silver',
    description: 'Effortless daily luxury',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop',
    productCount: products.filter(p => p.price < 4000).length,
  },
  {
    id: 'royal-noir',
    name: 'Royal Noir',
    description: 'Dark sophistication',
    image: 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=800&h=600&fit=crop',
    productCount: products.filter(p => p.isTrending).length,
  },
];

const CollectionsStory = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = isMobile ? 260 : 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div className="text-center md:text-left flex-1">
            <p className="font-accent text-xs text-primary tracking-widest uppercase mb-1">
              Explore
            </p>
            <h2 className="font-display text-2xl md:text-4xl text-foreground">
              Our Collections
            </h2>
          </div>
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full w-9 h-9"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full w-9 h-9"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Collections Slider */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
        >
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.id}`}
              className="group flex-shrink-0 w-[240px] md:w-[300px] snap-start"
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className={`relative overflow-hidden rounded-xl transition-all duration-500 ${
                index === activeIndex ? 'ring-2 ring-primary/50' : ''
              }`}>
                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <div className="transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <p className="font-body text-[10px] text-background/70 tracking-widest uppercase mb-1">
                      {collection.productCount} Pieces
                    </p>
                    <h3 className="font-display text-xl text-background mb-1">
                      {collection.name}
                    </h3>
                    <p className="font-body text-sm text-background/70 mb-3 line-clamp-1">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-accent font-body text-xs uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
                      Explore
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link to="/collections">
            <Button variant="luxury" size="lg">
              View All Collections
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CollectionsStory;