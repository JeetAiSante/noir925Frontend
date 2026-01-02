import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Crown, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
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
    subtitle: 'For Your Special Day',
    description: 'Exquisite bridal pieces handcrafted with love, featuring intricate designs that celebrate the beauty of your union.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=1000&fit=crop',
    icon: Crown,
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    accentColor: 'text-rose-400',
    productCount: getProductCount('bridal') || products.filter(p => p.category === 'Rings' || p.category === 'Necklaces').length,
  },
  {
    id: 'limited-edition',
    name: 'Limited Edition',
    subtitle: 'Exclusive Designs',
    description: 'One-of-a-kind masterpieces that define luxury. Each piece is a rare treasure, limited in quantity.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop',
    icon: Sparkles,
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    accentColor: 'text-amber-400',
    productCount: products.filter(p => p.isTrending).length,
  },
  {
    id: 'everyday-elegance',
    name: 'Everyday Elegance',
    subtitle: 'Daily Luxury',
    description: 'Understated sophistication for your everyday moments. Pieces that seamlessly blend with your lifestyle.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=1000&fit=crop',
    icon: Heart,
    gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
    accentColor: 'text-purple-400',
    productCount: products.filter(p => p.price < 4000).length,
  },
];

const CollectionsStory = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % collections.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-accent text-xs text-primary tracking-widest uppercase">Curated Collections</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Discover Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">Signature</span> Lines
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Each collection tells a unique story of craftsmanship, elegance, and timeless design
          </p>
        </motion.div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group"
              onMouseEnter={() => { setActiveIndex(index); setIsAutoPlaying(false); }}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <Link to={`/collections/${collection.id}`}>
                <div className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                  activeIndex === index ? 'border-primary/60 shadow-2xl scale-[1.02]' : 'border-border/50 hover:border-primary/40'
                }`}>
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={collection.image} alt={collection.name} className={`w-full h-full object-cover transition-all duration-700 ${activeIndex === index ? 'scale-110' : 'group-hover:scale-105'}`} loading="lazy" />
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient} opacity-60`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center">
                    <collection.icon className={`w-5 h-5 ${collection.accentColor}`} />
                  </div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <span className={`text-xs ${collection.accentColor} uppercase tracking-wider mb-1`}>{collection.subtitle}</span>
                    <h3 className="font-display text-2xl text-background mb-2">{collection.name}</h3>
                    <p className="text-background/70 text-sm mb-3 line-clamp-2">{collection.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-background/50 text-xs">{collection.productCount} Pieces</span>
                      <div className={`flex items-center gap-2 ${collection.accentColor} text-sm font-medium`}>Explore <ArrowRight className="w-4 h-4" /></div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile Slider */}
        <div ref={containerRef} className="lg:hidden">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory">
            {collections.map((collection, index) => (
              <Link key={collection.id} to={`/collections/${collection.id}`} className="group flex-shrink-0 w-[280px] snap-start">
                <div className="relative overflow-hidden rounded-2xl border border-border/50">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={collection.image} alt={collection.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient} opacity-60`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <span className={`text-[10px] ${collection.accentColor} uppercase tracking-wider mb-1`}>{collection.subtitle}</span>
                    <h3 className="font-display text-xl text-background mb-1">{collection.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-background/40 text-[10px]">{collection.productCount} Pieces</span>
                      <div className={`flex items-center gap-1 ${collection.accentColor} text-xs`}>Explore <ArrowRight className="w-3 h-3" /></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {collections.map((_, index) => (
              <button key={index} onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
          <Link to="/collections">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium shadow-xl shadow-primary/30">
              <Sparkles className="w-4 h-4" /> Explore All Collections <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CollectionsStory;
