import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CategoryCard {
  id: string;
  name: string;
  image: string;
  href: string;
}

const dailywearCategories: CategoryCard[] = [
  {
    id: 'rings',
    name: 'Dailywear Rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
    href: '/shop?category=rings&tag=dailywear',
  },
  {
    id: 'earrings',
    name: 'Dailywear Earrings',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    href: '/shop?category=earrings&tag=dailywear',
  },
  {
    id: 'pendants',
    name: 'Dailywear Pendants',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
    href: '/shop?category=pendants&tag=dailywear',
  },
  {
    id: 'bracelets',
    name: 'Dailywear Bracelets',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
    href: '/shop?category=bracelets&tag=dailywear',
  },
  {
    id: 'chains',
    name: 'Dailywear Chains',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
    href: '/shop?category=chains&tag=dailywear',
  },
];

const DailywearSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 480) return 1.5;
      if (window.innerWidth < 640) return 2;
      if (window.innerWidth < 768) return 2.5;
      if (window.innerWidth < 1024) return 3;
      return 3;
    }
    return 3;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardWidth = 160;
  const gap = 16;
  const maxIndex = Math.max(0, dailywearCategories.length - Math.floor(visibleCount));

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Touch scroll for mobile
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      setCurrentIndex(newIndex);
    }
  };

  return (
    <section 
      className="py-10 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden"
      aria-labelledby="dailywear-heading"
    >
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1920&h=800&fit=crop)',
        }}
        role="img"
        aria-label="Elegant jewelry background"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/90 to-background/70 md:from-background/95 md:via-background/80 md:to-background/60" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Mobile: Stacked layout, Tablet+: Side by side */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          
          {/* Featured Product Card */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group w-full max-w-xs sm:max-w-sm mx-auto lg:mx-0 order-2 lg:order-1"
          >
            <Link 
              to="/product/floral-grace-pendant"
              className="block relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden shadow-luxury bg-card"
              aria-label="View Floral Grace Diamond Pendant - ₹90,644"
            >
              <img
                src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&h=800&fit=crop"
                alt="Floral Grace Diamond Pendant featuring amethyst and citrine gemstones in a floral silver setting"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width={600}
                height={800}
              />
              
              {/* Expert's Choice Badge */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium rounded-md shadow-lg">
                  <span className="text-accent" aria-hidden="true">✦</span> 
                  <span>EXPERT'S CHOICE</span>
                </span>
              </div>

              {/* Wishlist Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setIsWishlisted(!isWishlisted);
                }}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart 
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isWishlisted ? 'fill-secondary text-secondary' : 'text-primary'}`}
                  aria-hidden="true"
                />
              </button>
            </Link>

            {/* Product Info */}
            <div className="mt-3 sm:mt-4 text-center lg:text-left px-1">
              <h3 className="font-display text-base sm:text-lg md:text-xl text-foreground">
                Floral Grace Diamond Pendant
              </h3>
              <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mt-1 sm:mt-2">
                <span className="text-lg sm:text-xl md:text-2xl font-display text-primary">₹90,644</span>
                <span className="text-xs sm:text-sm text-secondary font-medium bg-secondary/10 px-2 py-0.5 rounded">Only 1 left!</span>
              </div>
            </div>
          </motion.article>

          {/* Category Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full order-1 lg:order-2"
          >
            <h2 
              id="dailywear-heading"
              className="font-display text-xl sm:text-2xl md:text-3xl text-center lg:text-left mb-4 sm:mb-6 md:mb-8 text-foreground"
            >
              Dailywear Jewellery
            </h2>

            <div className="relative">
              {/* Navigation Arrows - Hidden on mobile, visible on tablet+ */}
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="hidden sm:flex absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/90 border border-border shadow-lg items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous categories"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
              </button>

              <button
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className="hidden sm:flex absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/90 border border-border shadow-lg items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next categories"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
              </button>

              {/* Cards Container - Touch scroll on mobile, animated on desktop */}
              <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="overflow-x-auto sm:overflow-hidden px-1 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <motion.div 
                  className="flex gap-3 sm:gap-4 pb-2"
                  animate={{ x: typeof window !== 'undefined' && window.innerWidth >= 640 ? -currentIndex * (cardWidth + gap) : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {dailywearCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={category.href}
                      className="flex-shrink-0 w-[140px] sm:w-[150px] md:w-[160px] group snap-start"
                      aria-label={`Shop ${category.name}`}
                    >
                      <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-card border border-border/50 shadow-soft">
                        <img
                          src={category.image}
                          alt={`${category.name} collection - Silver jewelry for everyday wear`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          width={400}
                          height={400}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" aria-hidden="true" />
                      </div>
                      <p className="mt-2 sm:mt-3 text-center font-body text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </p>
                    </Link>
                  ))}
                </motion.div>
              </div>

              {/* Mobile Scroll Indicator */}
              <div className="flex sm:hidden justify-center gap-1.5 mt-3">
                {dailywearCategories.map((_, idx) => (
                  <span 
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-primary' : 'bg-border'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Dailywear Jewellery Collection",
          "description": "Elegant silver jewellery for everyday wear",
          "numberOfItems": dailywearCategories.length,
          "itemListElement": dailywearCategories.map((cat, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": cat.name,
            "url": `https://noir925.com${cat.href}`
          }))
        })
      }} />
    </section>
  );
};

export default DailywearSection;
