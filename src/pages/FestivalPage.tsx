import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Gift, Calendar, Percent, Star, ShoppingBag, Heart } from 'lucide-react';
import { formatPrice, Product } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';

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
      "@type": "Offer",
      "url": `https://noir925.com/festival/${theme.slug}`,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
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

const FestivalPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch festival theme
  const { data: theme, isLoading: themeLoading } = useQuery({
    queryKey: ['festival-theme', slug],
    queryFn: async () => {
      // If no slug, get active theme
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

  // Fetch featured products and transform to Product type
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['festival-products', theme?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('is_bestseller', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      
      // Transform DB products to match the Product interface expected by ProductCard
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

  // Fetch all festival themes for navigation
  const { data: allThemes } = useQuery({
    queryKey: ['all-festival-themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('festival_themes')
        .select('id, name, slug, is_active, discount_percent, banner_image')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${theme.name} Sale - Premium Silver Jewellery | NOIR925`}
        description={theme.special_offer || `Shop exclusive ${theme.name} collection. Get up to ${theme.discount_percent || 20}% off on premium 925 sterling silver jewellery. Limited time offer!`}
        keywords={`${theme.name.toLowerCase()}, festival jewellery, silver jewellery sale, ${theme.name.toLowerCase()} offers, NOIR925 sale`}
        canonicalUrl={`https://noir925.com/festival/${theme.slug}`}
        ogType="website"
      />
      <FestivalEventSchema theme={theme} />
      <SaleEventSchema theme={theme} />

      <Header />

      <main>
        {/* Hero Banner */}
        <section 
          className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${theme.background_color}, ${theme.secondary_color})` 
          }}
        >
          {/* Background Image */}
          {theme.banner_image && (
            <div className="absolute inset-0">
              <img 
                src={theme.banner_image} 
                alt={`${theme.name} celebration banner featuring silver jewellery`}
                className="w-full h-full object-cover opacity-30"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>
          )}

          {/* Animated Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ 
                  background: i % 2 === 0 ? theme.primary_color : theme.accent_color,
                  width: Math.random() * 8 + 4,
                  height: Math.random() * 8 + 4,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-30, 30, -30],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Festival Badge */}
              <Badge 
                className="mb-6 px-4 py-2 text-sm"
                style={{ 
                  background: `${theme.primary_color}20`,
                  color: theme.primary_color,
                  borderColor: theme.primary_color
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                Limited Time Festival Offer
              </Badge>

              {/* Title */}
              <h1 
                className="font-display text-4xl md:text-6xl lg:text-7xl mb-4"
                style={{ color: theme.primary_color }}
              >
                {theme.name}
              </h1>

              {/* Special Offer */}
              {theme.special_offer && (
                <p className="text-xl md:text-2xl text-foreground/80 mb-6 max-w-2xl mx-auto">
                  {theme.special_offer}
                </p>
              )}

              {/* Discount Badge */}
              {theme.discount_percent && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.accent_color})`,
                    boxShadow: `0 10px 40px ${theme.primary_color}40`
                  }}
                >
                  <Percent className="w-6 h-6 text-white" aria-hidden="true" />
                  <span className="text-2xl md:text-3xl font-display font-bold text-white">
                    Up to {theme.discount_percent}% OFF
                  </span>
                </motion.div>
              )}

              {/* Date Range */}
              {(theme.start_date || theme.end_date) && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {formatDate(theme.start_date)} - {formatDate(theme.end_date)}
                  </span>
                </div>
              )}

              {/* CTA */}
              <Link to="/shop">
                <Button 
                  size="lg"
                  className="group gap-2 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.accent_color})`,
                    color: 'white'
                  }}
                >
                  <Gift className="w-5 h-5" aria-hidden="true" />
                  <span className="font-display">Shop {theme.name} Collection</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Other Festival Themes */}
        {allThemes && allThemes.length > 1 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl md:text-3xl text-center mb-8">
                Explore Festival Collections
              </h2>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                {allThemes.map((t) => (
                  <Link
                    key={t.id}
                    to={`/festival/${t.slug}`}
                    className={`flex-shrink-0 w-64 rounded-xl overflow-hidden transition-all duration-300 ${
                      t.slug === theme.slug ? 'ring-2 ring-primary scale-105' : 'hover:scale-105'
                    }`}
                  >
                    <Card className="h-full">
                      <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 relative">
                        {t.banner_image && (
                          <img 
                            src={t.banner_image} 
                            alt={`${t.name} collection preview`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                        {t.is_active && (
                          <Badge className="absolute top-2 right-2 bg-green-500">Active</Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-display text-lg">{t.name}</h3>
                        {t.discount_percent && (
                          <p className="text-sm text-primary">Up to {t.discount_percent}% OFF</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl mb-4">
                Featured {theme.name} Collection
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our handpicked selection of premium 925 sterling silver jewellery, 
                perfect for celebrating this festive season.
              </p>
            </motion.div>

            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products?.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link to="/shop">
                <Button variant="outline" size="lg" className="gap-2">
                  View All Products
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Shop During Festival */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl text-center mb-12">
              Why Shop During {theme.name}?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
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
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow">
                    <div 
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                      style={{ background: `${theme.primary_color}20` }}
                    >
                      <item.icon className="w-8 h-8" style={{ color: theme.primary_color }} />
                    </div>
                    <h3 className="font-display text-xl mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </Card>
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
