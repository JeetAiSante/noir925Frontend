import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Gift, Heart, Sparkles, Star, ArrowRight, Check, ChevronRight, Crown, Diamond, Gem, Cake, PartyPopper, Calendar, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import { useCurrency } from '@/context/CurrencyContext';
import { SEOHead } from '@/components/seo/SEOHead';

// Occasion icons data
const occasionIcons = [
  { id: 1, icon: Heart, label: 'Heartfull', color: 'from-rose-500 to-pink-600' },
  { id: 2, icon: Gift, label: 'Timeless', color: 'from-purple-500 to-violet-600' },
  { id: 3, icon: Diamond, label: 'Precious', color: 'from-cyan-400 to-blue-500' },
  { id: 4, icon: Crown, label: 'Time For Me', color: 'from-amber-400 to-orange-500' },
  { id: 5, icon: PartyPopper, label: 'Anniversary', color: 'from-emerald-400 to-green-500' },
];

// Price range data
const priceRanges = [
  { id: 1, range: 'Under ₹5K', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', link: '/shop?maxPrice=5000' },
  { id: 2, range: '₹5K - ₹10K', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', link: '/shop?minPrice=5000&maxPrice=10000' },
  { id: 3, range: '₹10K - ₹15K', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400', link: '/shop?minPrice=10000&maxPrice=15000' },
  { id: 4, range: '₹15K & Above', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400', link: '/shop?minPrice=15000' },
];

// Shop by occasion data
const shopByOccasion = [
  { id: 1, title: 'Wedding', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', link: '/shop?occasion=wedding' },
  { id: 2, title: 'Birthday', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600', link: '/shop?occasion=birthday' },
  { id: 3, title: 'Engagement', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600', link: '/shop?occasion=engagement' },
  { id: 4, title: 'Treat Yourself', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600', link: '/shop?occasion=self-love' },
  { id: 5, title: 'Anniversary', image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=600', link: '/shop?occasion=anniversary' },
];

const wrappingOptions = [
  {
    id: 'standard',
    name: 'Standard Gift Box',
    description: 'Elegant black box with ribbon',
    price: 0,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&h=200&fit=crop',
    included: true,
  },
  {
    id: 'premium',
    name: 'Premium Wooden Box',
    description: 'Handcrafted wooden box with velvet lining',
    price: 299,
    image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=200&h=200&fit=crop',
    included: false,
  },
  {
    id: 'luxury',
    name: 'Luxury Gift Set',
    description: 'Box, pouch, ribbon, card & care kit',
    price: 499,
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=200&h=200&fit=crop',
    included: false,
  },
];

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 6,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size }}
          initial={{ y: '100vh', opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
};

const Gifting = () => {
  const { formatPrice } = useCurrency();
  const [selectedWrapping, setSelectedWrapping] = useState('standard');
  const [giftMessage, setGiftMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('jewellery');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  const { data: giftProducts = [] } = useQuery({
    queryKey: ['gift-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_bestseller', true)
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
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Premium Gift Collection | NOIR925 Silver Jewellery"
        description="Find the perfect 925 sterling silver gift for every occasion. Explore curated collections for weddings, anniversaries, birthdays with premium gift wrapping."
        keywords="silver gifts, wedding gifts, anniversary gifts, birthday jewellery, premium gift wrapping, 925 silver gifts"
      />
      <Header />
      
      <main className="pt-20">
        {/* Hero Section with Parallax */}
        <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-amber-50/50 to-violet-100/60 dark:from-rose-950/30 dark:via-background dark:to-violet-950/30" />
          
          <FloatingParticles />
          
          {/* Decorative circles */}
          <motion.div 
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-amber-300/20 to-rose-300/20 blur-2xl"
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
          />

          <motion.div style={{ y: heroY }} className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Animated badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-primary/20 mb-8 shadow-lg"
                animate={{ 
                  boxShadow: [
                    '0 4px 20px rgba(139, 43, 77, 0.1)',
                    '0 4px 40px rgba(139, 43, 77, 0.2)',
                    '0 4px 20px rgba(139, 43, 77, 0.1)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Find The Perfect Piece To Celebrate Life's Special Moments</span>
              </motion.div>

              <motion.h1 
                className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                The Art of{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-rose-500 to-primary bg-clip-text text-transparent italic">
                    Gifting
                  </span>
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Discover breathtaking silver pieces crafted to make every moment unforgettable. 
                From elegant gift guides to premium wrapping, we make gifting extraordinary.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link to="/shop">
                  <Button size="lg" className="gap-2 text-base md:text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all">
                    <Gift className="w-5 h-5" /> Shop All Gifts
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2 text-base md:text-lg px-8 py-6 rounded-full border-2">
                  <Heart className="w-5 h-5" /> Create Wishlist
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
              <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* Occasion Icons Strip */}
        <section className="py-12 bg-gradient-to-r from-muted/30 via-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {occasionIcons.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div 
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </motion.div>
                  <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gift Curator Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Curator form */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/20 dark:to-rose-950/20 rounded-3xl p-8 md:p-10 border border-amber-200/50 dark:border-amber-800/30"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-primary/10">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Not Sure What To Buy?</p>
                      <h2 className="font-display text-2xl md:text-3xl text-foreground">Try Our Gift Curator</h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="text-sm text-muted-foreground">I am looking for exquisite</span>
                      <select 
                        className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="jewellery">Jewellery</option>
                        <option value="rings">Rings</option>
                        <option value="necklaces">Necklaces</option>
                        <option value="bracelets">Bracelets</option>
                        <option value="earrings">Earrings</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="text-sm text-muted-foreground">within</span>
                      <select 
                        className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary"
                        value={selectedPriceRange}
                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                      >
                        <option value="">Choose Price</option>
                        <option value="5000">Under ₹5,000</option>
                        <option value="10000">₹5,000 - ₹10,000</option>
                        <option value="15000">₹10,000 - ₹15,000</option>
                        <option value="25000">₹15,000+</option>
                      </select>
                      <span className="text-sm text-muted-foreground">for</span>
                      <select 
                        className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary"
                        value={selectedOccasion}
                        onChange={(e) => setSelectedOccasion(e.target.value)}
                      >
                        <option value="">Choose Relation</option>
                        <option value="wife">Wife</option>
                        <option value="mother">Mother</option>
                        <option value="sister">Sister</option>
                        <option value="girlfriend">Girlfriend</option>
                        <option value="friend">Friend</option>
                        <option value="self">Myself</option>
                      </select>
                    </div>

                    <Link to={`/shop?category=${selectedCategory}&maxPrice=${selectedPriceRange}`}>
                      <Button className="w-full md:w-auto mt-4 gap-2 rounded-full px-8">
                        <Gem className="w-4 h-4" /> Continue
                      </Button>
                    </Link>
                  </div>
                </motion.div>

                {/* Curator image */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative hidden lg:block"
                >
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop"
                      alt="Premium gift box with silver jewellery"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
                  </div>
                  {/* Floating badge */}
                  <motion.div 
                    className="absolute -bottom-4 -right-4 bg-white dark:bg-card rounded-2xl p-4 shadow-xl border border-border"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Premium</p>
                        <p className="font-semibold">Gift Packaging</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Gift By Range Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
                Gift By Range
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore The Gifting Range That Fits Your Budget
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {priceRanges.map((range, index) => (
                <motion.div
                  key={range.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={range.link}>
                    <motion.div 
                      className="group relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                      whileHover={{ scale: 1.03 }}
                    >
                      <img
                        src={range.image}
                        alt={range.range}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="font-display text-lg md:text-2xl">{range.range}</h3>
                      </div>
                      {/* Shimmer effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Shop By Occasion - Bento Grid Style */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
                Shop By Occasion
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore The Curated Gifting List For Every Occasion
              </p>
            </motion.div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
              {/* Large card - Wedding */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="col-span-2 row-span-2"
              >
                <Link to={shopByOccasion[0].link}>
                  <motion.div 
                    className="group relative h-full min-h-[300px] md:min-h-[500px] rounded-3xl overflow-hidden shadow-xl"
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={shopByOccasion[0].image}
                      alt={shopByOccasion[0].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                    <motion.div 
                      className="absolute bottom-6 left-6 right-6"
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="font-display text-3xl md:text-4xl text-white mb-2">{shopByOccasion[0].title}</h3>
                      <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                        <span className="text-sm">Explore Collection</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Smaller cards */}
              {shopByOccasion.slice(1).map((occasion, index) => (
                <motion.div
                  key={occasion.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={occasion.link}>
                    <motion.div 
                      className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={occasion.image}
                        alt={occasion.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-display text-lg md:text-xl text-white">{occasion.title}</h3>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gift Wrapping Options - 3D Cards */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
                Premium Gift Wrapping
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Make your gift extra special with our premium packaging options
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {wrappingOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 30, rotateY: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -10, rotateY: 5 }}
                  onClick={() => setSelectedWrapping(option.id)}
                  className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all bg-card shadow-lg hover:shadow-2xl ${
                    selectedWrapping === option.id
                      ? 'border-primary ring-4 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                >
                  {option.included && (
                    <motion.span 
                      className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Included
                    </motion.span>
                  )}
                  {selectedWrapping === option.id && (
                    <motion.div 
                      className="absolute top-4 left-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  )}
                  <motion.img
                    src={option.image}
                    alt={option.name}
                    className="w-24 h-24 mx-auto rounded-xl object-cover mb-4 shadow-md"
                    whileHover={{ scale: 1.1, rotateZ: 5 }}
                  />
                  <h3 className="font-display text-xl text-center mb-2">{option.name}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-3">{option.description}</p>
                  <p className="text-center font-bold text-lg text-primary">
                    {option.price === 0 ? 'Free' : `+${formatPrice(option.price)}`}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Personalization Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
                  Add a Personal Touch
                </h2>
                <p className="text-muted-foreground">
                  Include a heartfelt message with your gift
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-2 border-border/50 shadow-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Recipient's Name</label>
                      <Input
                        placeholder="Enter recipient's name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Gift Message</label>
                      <Textarea
                        placeholder="Write a personal message to be included with your gift..."
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        rows={4}
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {giftMessage.length}/200 characters
                      </p>
                    </div>
                    <motion.div 
                      className="bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/30"
                      whileHover={{ scale: 1.02 }}
                    >
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" fill="currentColor" /> Message Preview
                      </h4>
                      <div className="bg-white dark:bg-card p-5 rounded-xl border border-border text-center shadow-inner">
                        <p className="text-sm text-muted-foreground mb-2">To: {recipientName || 'Your loved one'}</p>
                        <p className="italic text-foreground">{giftMessage || 'Your message will appear here...'}</p>
                        <p className="text-xs text-muted-foreground mt-3">— With love ❤️</p>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Gift-Worthy Products */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
                Top Picks
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Explore What's Trending
              </p>
              
              {/* Filter tabs */}
              <div className="flex justify-center gap-3">
                <Button variant="default" size="sm" className="rounded-full">Most Wishlisted</Button>
                <Button variant="outline" size="sm" className="rounded-full">Most Bought</Button>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {giftProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link to="/shop">
                <Button size="lg" className="gap-2 rounded-full px-10">
                  View All Products <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Gift Card Section - Premium Design */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className="relative rounded-[2rem] overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20" />
                
                <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-14 items-center">
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                    >
                      <h2 className="font-display text-4xl md:text-5xl text-foreground mb-5">
                        Give the Gift of <span className="text-primary italic">Choice</span>
                      </h2>
                      <p className="text-muted-foreground mb-8 text-lg">
                        Not sure what to pick? Let them choose with a NOIR925 gift card. 
                        Available in multiple denominations.
                      </p>
                      <div className="flex flex-wrap gap-3 mb-8">
                        {['₹1,000', '₹2,500', '₹5,000', '₹10,000'].map((amount) => (
                          <motion.span 
                            key={amount} 
                            className="px-5 py-2.5 bg-background rounded-full text-sm font-semibold border-2 border-border hover:border-primary cursor-pointer transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {amount}
                          </motion.span>
                        ))}
                      </div>
                      <Button size="lg" className="gap-2 rounded-full px-10">
                        <Gift className="w-5 h-5" /> Buy Gift Card
                      </Button>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, rotateY: -30 }}
                    whileInView={{ opacity: 1, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 100 }}
                  >
                    {/* 3D Gift Card */}
                    <motion.div 
                      className="aspect-[16/10] bg-gradient-to-br from-primary via-rose-500 to-accent rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden"
                      whileHover={{ rotateY: 10, rotateX: -5 }}
                      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                    >
                      {/* Card pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{ 
                          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                          backgroundSize: '20px 20px'
                        }} />
                      </div>
                      
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="font-display text-2xl">NOIR925</span>
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                          >
                            <Gift className="w-8 h-8" />
                          </motion.div>
                        </div>
                        <div>
                          <p className="text-sm opacity-70 mb-1">Gift Card</p>
                          <p className="font-display text-4xl">₹5,000</p>
                        </div>
                      </div>

                      {/* Shine effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      />
                    </motion.div>

                    {/* Decorative shadow card behind */}
                    <div className="absolute -bottom-4 left-4 right-4 h-16 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-xl -z-10" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Gifting;
