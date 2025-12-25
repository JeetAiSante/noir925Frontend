import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';

const priceRanges = [
  { label: 'Under ₹299', max: 299, color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-500/10' },
  { label: 'Under ₹499', max: 499, color: 'from-primary to-accent', bgColor: 'bg-primary/10' },
  { label: 'Under ₹999', max: 999, color: 'from-secondary to-pink-500', bgColor: 'bg-secondary/10' },
  { label: 'Under ₹1499', max: 1499, color: 'from-purple-500 to-indigo-500', bgColor: 'bg-purple-500/10' },
];

const PriceBasedProducts = () => {
  const [selectedRange, setSelectedRange] = useState(priceRanges[1]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['price-products', selectedRange.max],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('price', selectedRange.max)
        .eq('is_active', true)
        .order('price', { ascending: true })
        .limit(8);
      
      if (error) throw error;
      return data.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        image: Array.isArray(p.images) && p.images.length > 0 ? String(p.images[0]) : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        images: Array.isArray(p.images) ? p.images.map(String) : [],
        category: 'Silver',
        rating: Number(p.rating) || 4.5,
        reviews: p.reviews_count || 0,
        isNew: p.is_new,
        isBestseller: p.is_bestseller,
        discount: p.discount_percent,
        material: p.material || '925 Silver',
        weight: p.weight || '5g',
        purity: '92.5% Pure Silver',
        description: p.short_description || p.description || '',
      }));
    },
  });

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

        {/* Price Range Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {priceRanges.map((range) => (
            <motion.button
              key={range.max}
              onClick={() => setSelectedRange(range)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                selectedRange.max === range.max
                  ? 'text-white shadow-lg'
                  : 'bg-muted/50 text-foreground hover:bg-muted border border-border/50'
              }`}
            >
              {selectedRange.max === range.max && (
                <motion.div
                  layoutId="price-pill"
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${range.color}`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{range.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl shimmer-skeleton" />
            ))
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No products found in this price range</p>
            </div>
          )}
        </div>

        {/* View All Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link 
            to={`/shop?maxPrice=${selectedRange.max}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all hover:gap-3"
          >
            View All {selectedRange.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PriceBasedProducts;
