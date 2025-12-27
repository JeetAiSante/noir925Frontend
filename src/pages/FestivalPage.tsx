import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Gift, Percent, Star, ShoppingBag, Clock, Filter } from 'lucide-react';
import { Product } from '@/data/products';
import { useCurrency } from '@/context/CurrencyContext';
import ProductCard from '@/components/products/ProductCard';
import OptimizedImage from '@/components/ui/optimized-image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FestivalTheme {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  banner_image: string | null;
  logo_overlay: string | null;
  discount_percent: number | null;
  special_offer: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

interface DBProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  images: any;
  rating: number | null;
  reviews_count: number | null;
  is_new: boolean;
  is_bestseller: boolean;
  stock_quantity: number;
  category_id: string | null;
  description: string | null;
  material: string | null;
  weight: string | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Festival Event Schema Component
const FestivalEventSchema = ({ theme }: { theme: FestivalTheme }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": `${theme.name} Sale at NOIR925`,
    "description": theme.special_offer || `Shop exclusive ${theme.name} collection with special discounts on premium 925 sterling silver jewellery`,
    "startDate": theme.start_date || new Date().toISOString(),
    "endDate": theme.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": `https://noir925.com/festival/${theme.slug}`
    },
    "organizer": {
      "@type": "Organization",
      "name": "NOIR925",
      "url": "https://noir925.com"
    },
    "offers": {
      "@type": "AggregateOffer",
      "url": `https://noir925.com/festival/${theme.slug}`,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "lowPrice": "499",
      "highPrice": "50000",
      "offerCount": "100+",
      "validFrom": theme.start_date || new Date().toISOString()
    },
    "image": theme.banner_image || "https://noir925.com/festival-banner.jpg"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

// Sale Event Schema
const SaleEventSchema = ({ theme }: { theme: FestivalTheme }) => {
  if (!theme.discount_percent) return null;
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SaleEvent",
    "name": `${theme.name} - Up to ${theme.discount_percent}% Off`,
    "description": theme.special_offer || `Get up to ${theme.discount_percent}% discount on premium silver jewellery`,
    "startDate": theme.start_date,
    "endDate": theme.end_date,
    "location": {
      "@type": "VirtualLocation",
      "url": `https://noir925.com/festival/${theme.slug}`
    },
    "organizer": {
      "@type": "Organization",
      "name": "NOIR925"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

// Product List Schema for SEO
const ProductListSchema = ({ products, theme }: { products: Product[]; theme: FestivalTheme }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${theme.name} Collection - NOIR925`,
    "description": `Festival sale products with ${theme.discount_percent}% off`,
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 10).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "image": product.image,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

const FestivalPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { formatPrice } = useCurrency();
  const [sortBy, setSortBy] = useState<string>('featured');
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Fetch festival theme
  const { data: theme, isLoading: themeLoading } = useQuery({
    queryKey: ['festival-theme', slug],
    queryFn: async () => {
      let query = supabase.from('festival_themes').select('*');
      
      if (slug) {
        query = query.eq('slug', slug);
      } else {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.limit(1).single();
      if (error) throw error;
      return data as FestivalTheme;
    },
    retry: false,
  });

  // Fetch ONLY products with discount (festival sale products)
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['festival-products', theme?.id, theme?.discount_percent, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('discount_percent', 0); // Only products with discount

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'discount':
          query = query.order('discount_percent', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('is_bestseller', { ascending: false });
      }

      const { data, error } = await query.limit(24);
      if (error) throw error;
      
      // Transform DB products to match the Product interface
      return data.map((p: DBProduct): Product => {
        const images = Array.isArray(p.images) ? p.images : [];
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.original_price || undefined,
          image: images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
          images: images,
          category: 'Jewellery',
          description: p.description || '',
          rating: p.rating || 4.5,
          reviews: p.reviews_count || 0,
          isNew: p.is_new,
          isBestseller: p.is_bestseller,
          discount: p.discount_percent || undefined,
          material: p.material || '925 Sterling Silver',
          weight: p.weight || '5g',
          purity: '92.5% Pure Silver',
          stockQuantity: p.stock_quantity,
        };
      });
    },
    enabled: !!theme,
  });

  // Countdown timer effect
  useEffect(() => {
    if (!theme?.end_date) return;

    const calculateTimeLeft = () => {
      const endDate = new Date(theme.end_date!).getTime();
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [theme?.end_date]);

  if (themeLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="font-display text-3xl mb-4">No Active Festival</h1>
          <p className="text-muted-foreground mb-8">
            Check back soon for exciting festival offers and collections!
          </p>
          <Link to="/shop">
            <Button size="lg">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse All Products
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const hasTimeLeft = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${theme.name} Sale - Up to ${theme.discount_percent || 20}% Off | NOIR925`}
        description={`${theme.special_offer || `Shop exclusive ${theme.name} collection`}. Get up to ${theme.discount_percent || 20}% off on premium 925 sterling silver jewellery. Limited time festival offer!`}
        keywords={`${theme.name.toLowerCase()}, festival jewellery sale, silver jewellery offers, ${theme.name.toLowerCase()} discounts, NOIR925 festival sale, buy silver jewellery online India, ${theme.name.toLowerCase()} silver collection`}
        canonicalUrl={`https://noir925.com/festival/${theme.slug}`}
        ogType="website"
      />
      <FestivalEventSchema theme={theme} />
      <SaleEventSchema theme={theme} />
      {products && products.length > 0 && <ProductListSchema products={products} theme={theme} />}

      <Header />

      <main>
        {/* Hero Banner */}
        <section 
          className="relative min-h-[40vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${theme.background_color}, ${theme.secondary_color})` 
          }}
        >
          {/* Background Image */}
          {theme.banner_image && (
            <div className="absolute inset-0">
              <OptimizedImage 
                src={theme.banner_image} 
                alt={`${theme.name} celebration banner featuring silver jewellery`}
                className="w-full h-full object-cover opacity-40"
                priority
                fallback="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
          )}

          {/* Animated Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ 
                  background: i % 2 === 0 ? theme.primary_color : theme.accent_color,
                  width: Math.random() * 6 + 3,
                  height: Math.random() * 6 + 3,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Festival Badge */}
              <Badge 
                className="mb-4 px-3 py-1.5 text-xs md:text-sm"
                style={{ 
                  background: `${theme.primary_color}20`,
                  color: theme.primary_color,
                  borderColor: theme.primary_color
                }}
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1.5" aria-hidden="true" />
                Limited Time Festival Offer
              </Badge>

              {/* Title */}
              <h1 
                className="font-display text-3xl md:text-5xl lg:text-6xl mb-3"
                style={{ color: theme.primary_color }}
              >
                {theme.name}
              </h1>

              {/* Special Offer */}
              {theme.special_offer && (
                <p className="text-lg md:text-xl text-foreground/80 mb-4 max-w-xl mx-auto">
                  {theme.special_offer}
                </p>
              )}

              {/* Discount Badge */}
              {theme.discount_percent && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.accent_color})`,
                    boxShadow: `0 8px 30px ${theme.primary_color}35`
                  }}
                >
                  <Percent className="w-5 h-5 text-white" aria-hidden="true" />
                  <span className="text-xl md:text-2xl font-display font-bold text-white">
                    Up to {theme.discount_percent}% OFF
                  </span>
                </motion.div>
              )}

              {/* Countdown Timer */}
              {hasTimeLeft && theme.end_date && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm mb-3">
                    <Clock className="w-4 h-4" style={{ color: theme.primary_color }} />
                    <span>Sale ends in</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    {[
                      { value: timeLeft.days, label: 'Days' },
                      { value: timeLeft.hours, label: 'Hours' },
                      { value: timeLeft.minutes, label: 'Mins' },
                      { value: timeLeft.seconds, label: 'Secs' },
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-lg md:text-2xl font-bold shadow-lg mb-1"
                          style={{ 
                            background: `linear-gradient(145deg, ${theme.primary_color}25, ${theme.accent_color}20)`,
                            border: `1px solid ${theme.primary_color}30`,
                            color: theme.primary_color
                          }}
                        >
                          {String(item.value).padStart(2, '0')}
                        </div>
                        <span className="text-[10px] md:text-xs text-muted-foreground">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4">
            {/* Header with Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl mb-1">
                  {theme.name} Sale Products
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  {products?.length || 0} products on sale with exclusive discounts
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 md:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="discount">Highest Discount</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl mb-2">No Sale Products Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Products with discounts will appear here during the festival sale.
                </p>
                <Link to="/shop">
                  <Button variant="outline">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Browse All Products
                  </Button>
                </Link>
              </div>
            )}

            {products && products.length > 0 && (
              <div className="text-center mt-10">
                <Link to="/shop">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2"
                    style={{ borderColor: theme.primary_color, color: theme.primary_color }}
                  >
                    View All Products
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Why Shop Section */}
        <section 
          className="py-12 md:py-16"
          style={{ background: `${theme.primary_color}08` }}
        >
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl text-center mb-8 md:mb-10">
              Why Shop During {theme.name}?
            </h2>
            <div className="grid md:grid-cols-3 gap-5 md:gap-6">
              {[
                {
                  icon: Percent,
                  title: 'Exclusive Discounts',
                  description: `Get up to ${theme.discount_percent || 20}% off on premium silver jewellery`
                },
                {
                  icon: Gift,
                  title: 'Perfect Gifting',
                  description: 'Find the ideal gift for your loved ones this festive season'
                },
                {
                  icon: Star,
                  title: 'Premium Quality',
                  description: 'BIS Hallmarked 925 sterling silver with lifetime warranty'
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-5 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-full flex items-center justify-center mb-3"
                    style={{ background: `${theme.primary_color}15` }}
                  >
                    <item.icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: theme.primary_color }} />
                  </div>
                  <h3 className="font-display text-lg mb-1.5">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FestivalPage;
