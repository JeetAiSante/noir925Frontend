import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    id: 'necklaces',
    name: 'Necklaces',
    description: 'Elegant chains and statement pendants',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
    count: 48,
  },
  {
    id: 'earrings',
    name: 'Earrings',
    description: 'From studs to chandelier drops',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop',
    count: 62,
  },
  {
    id: 'rings',
    name: 'Rings',
    description: 'Bands, cocktails & statement pieces',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop',
    count: 35,
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    description: 'Cuffs, chains & charm bracelets',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=800&fit=crop',
    count: 28,
  },
];

const FeaturedCategories = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2 }
    );

    const items = sectionRef.current?.querySelectorAll('[data-index]');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-foreground">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-sm text-accent tracking-widest uppercase mb-2">
            Explore
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-background">
            Shop by Category
          </h2>
        </div>

        {/* Categories Grid */}
        <div ref={sectionRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              data-index={index}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-700 ${
                visibleItems.has(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    hoveredIndex === index ? 'scale-110' : 'scale-100'
                  }`}
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              {/* Content */}
              <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                  <p className="font-body text-xs text-background/60 mb-1">
                    {category.count} Products
                  </p>
                  <h3 className="font-display text-xl md:text-2xl text-background mb-2 flex items-center gap-2">
                    {category.name}
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>
                  <p className="font-body text-sm text-background/70 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hidden md:block">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shimmer" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
