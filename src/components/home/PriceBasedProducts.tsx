import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';

const priceRanges = [
  { label: 'Under ₹299', max: 299, color: 'from-emerald-500 to-teal-500', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400' },
  { label: 'Under ₹499', max: 499, color: 'from-primary to-accent', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400' },
  { label: 'Under ₹999', max: 999, color: 'from-secondary to-pink-500', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' },
  { label: 'Under ₹1499', max: 1499, color: 'from-purple-500 to-indigo-500', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400' },
  { label: 'Under ₹1999', max: 1999, color: 'from-amber-500 to-orange-500', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400' },
];

const PriceBasedProducts = () => {
  const { settings } = useLayoutSettings();
  
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Budget Friendly</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
            Shop by <span className="text-primary">Budget</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find stunning silver pieces that fit your budget perfectly
          </p>
        </motion.div>

        {/* Price Category Cards Grid */}
        <style>{`
          .price-grid { 
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(${settings.productsPerRowMobile}, 1fr);
          }
          @media (min-width: 640px) {
            .price-grid { 
              gap: 1.5rem;
              grid-template-columns: repeat(${settings.productsPerRowTablet}, 1fr); 
            }
          }
          @media (min-width: 1024px) {
            .price-grid { grid-template-columns: repeat(${settings.productsPerRow}, 1fr); }
          }
        `}</style>
        <div className="price-grid">
          {priceRanges.map((range, index) => (
            <motion.div
              key={range.max}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`/shop?maxPrice=${range.max}`}
                className="group block relative overflow-hidden rounded-2xl aspect-[3/4] bg-muted"
              >
                {/* Background Image */}
                <img 
                  src={range.image} 
                  alt={range.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${range.color} opacity-60 group-hover:opacity-70 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <motion.div
                    className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-3"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-white font-display text-lg md:text-xl font-semibold">
                      {range.label}
                    </span>
                  </motion.div>
                  
                  <div className="flex items-center gap-1 text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link 
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all hover:gap-3"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PriceBasedProducts;
