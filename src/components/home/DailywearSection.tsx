import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
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
  const visibleCount = 3;

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + visibleCount >= dailywearCategories.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, dailywearCategories.length - visibleCount) : prev - 1
    );
  };

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1920&h=800&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Featured Product */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-luxury">
              <img
                src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&h=800&fit=crop"
                alt="Featured Dailywear"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Expert's Choice Badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md shadow-lg">
                  <span className="text-accent">✦</span> EXPERT'S CHOICE
                </span>
              </div>

              {/* Wishlist */}
              <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>

            {/* Product Info */}
            <div className="mt-4 text-center lg:text-left">
              <h3 className="font-display text-xl">Floral Grace Diamond Pendant</h3>
              <div className="flex items-center justify-center lg:justify-start gap-3 mt-2">
                <span className="text-2xl font-display text-primary">₹90,644</span>
                <span className="text-sm text-secondary font-medium">Only 1 left!</span>
              </div>
            </div>
          </motion.div>

          {/* Right - Category Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="font-display text-2xl md:text-3xl text-center lg:text-left mb-8">
              Dailywear Jewellery
            </h2>

            <div className="relative">
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Cards Container */}
              <div className="overflow-hidden px-2">
                <motion.div 
                  className="flex gap-4"
                  animate={{ x: -currentIndex * (180 + 16) }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {dailywearCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={category.href}
                      className="flex-shrink-0 w-[160px] md:w-[180px] group"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border/50 shadow-soft">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                      </div>
                      <p className="mt-3 text-center font-body text-sm group-hover:text-primary transition-colors">
                        {category.name}
                      </p>
                    </Link>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DailywearSection;
