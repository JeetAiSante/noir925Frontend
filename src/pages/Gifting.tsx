import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Heart, Package, Sparkles, Star, ArrowRight, Check, ChevronRight } from 'lucide-react';
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

const giftGuides = [
  {
    id: 1,
    title: 'Gifts for Her',
    description: 'Elegant pieces she\'ll treasure forever',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop',
    link: '/shop?gender=women',
    priceRange: '₹999 - ₹9,999',
  },
  {
    id: 2,
    title: 'Gifts for Him',
    description: 'Bold and masculine silver designs',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&h=400&fit=crop',
    link: '/shop?gender=men',
    priceRange: '₹1,499 - ₹7,999',
  },
  {
    id: 3,
    title: 'Anniversary Gifts',
    description: 'Celebrate your special moments',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
    link: '/shop?occasion=anniversary',
    priceRange: '₹2,999 - ₹19,999',
  },
  {
    id: 4,
    title: 'Wedding Gifts',
    description: 'Perfect presents for the happy couple',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=400&fit=crop',
    link: '/shop?occasion=wedding',
    priceRange: '₹4,999 - ₹29,999',
  },
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

const Gifting = () => {
  const { formatPrice } = useCurrency();
  const [selectedWrapping, setSelectedWrapping] = useState('standard');
  const [giftMessage, setGiftMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');

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
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Thoughtful Gifting</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-foreground mb-6">
                The Art of <span className="text-primary">Gifting</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Find the perfect silver piece for every occasion. From elegant gift guides to premium 
                wrapping options, we make gifting memorable.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/shop">
                  <Button size="lg" className="gap-2">
                    <Sparkles className="w-4 h-4" /> Shop Gifts
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2">
                  <Heart className="w-4 h-4" /> Create Wishlist
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Gift Guides */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                Gift Guides
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Not sure what to get? Our curated gift guides help you find the perfect piece
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {giftGuides.map((guide, index) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={guide.link}>
                    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={guide.image}
                          alt={guide.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="font-display text-xl mb-1">{guide.title}</h3>
                          <p className="text-sm text-white/80">{guide.priceRange}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{guide.description}</p>
                        <div className="flex items-center gap-2 mt-3 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                          Shop Now <ArrowRight className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gift Wrapping Options */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
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
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedWrapping(option.id)}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    selectedWrapping === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {option.included && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      Included
                    </span>
                  )}
                  {selectedWrapping === option.id && (
                    <div className="absolute top-3 left-3">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <img
                    src={option.image}
                    alt={option.name}
                    className="w-20 h-20 mx-auto rounded-lg object-cover mb-4"
                  />
                  <h3 className="font-display text-lg text-center mb-1">{option.name}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-2">{option.description}</p>
                  <p className="text-center font-semibold text-primary">
                    {option.price === 0 ? 'Free' : `+${formatPrice(option.price)}`}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Personalization */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  Add a Personal Touch
                </h2>
                <p className="text-muted-foreground">
                  Include a heartfelt message with your gift
                </p>
              </motion.div>

              <Card className="border-border/50">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Recipient's Name</label>
                    <Input
                      placeholder="Enter recipient's name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Gift Message</label>
                    <Textarea
                      placeholder="Write a personal message to be included with your gift..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {giftMessage.length}/200 characters
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-accent" /> Preview
                    </h4>
                    <div className="bg-background p-4 rounded border border-border text-center">
                      <p className="text-sm text-muted-foreground mb-1">To: {recipientName || 'Your loved one'}</p>
                      <p className="italic">{giftMessage || 'Your message will appear here...'}</p>
                      <p className="text-xs text-muted-foreground mt-2">- With love</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                Gift-Worthy Picks
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our most loved pieces, perfect for gifting
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {giftProducts.map((product, index) => (
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

            <div className="text-center mt-10">
              <Link to="/shop">
                <Button size="lg" className="gap-2">
                  View All Products <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Gift Card Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                    Give the Gift of Choice
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Not sure what to pick? Let them choose with a NOIR925 gift card. 
                    Available in multiple denominations.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['₹1,000', '₹2,500', '₹5,000', '₹10,000'].map((amount) => (
                      <span key={amount} className="px-4 py-2 bg-background rounded-full text-sm font-medium border border-border">
                        {amount}
                      </span>
                    ))}
                  </div>
                  <Button size="lg" className="gap-2">
                    <Gift className="w-4 h-4" /> Buy Gift Card
                  </Button>
                </div>
                <div className="relative">
                  <div className="aspect-[16/10] bg-gradient-to-br from-primary via-accent to-secondary rounded-xl p-6 text-white shadow-2xl">
                    <div className="flex justify-between items-start">
                      <span className="font-display text-xl">NOIR925</span>
                      <Gift className="w-6 h-6" />
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <p className="text-sm opacity-70">Gift Card</p>
                      <p className="font-display text-2xl">₹5,000</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Gifting;
