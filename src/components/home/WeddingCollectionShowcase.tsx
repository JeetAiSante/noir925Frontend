import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/context/CurrencyContext';

const WeddingCollectionShowcase = () => {
  const { formatPrice } = useCurrency();

  const galleryImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
      alt: 'Gold bridal necklace with intricate design',
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop',
      alt: 'Pearl bracelet with silver clasp',
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=400&fit=crop',
      alt: 'Diamond pendant necklace',
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=400&fit=crop',
      alt: 'Emerald gemstone on leaf',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-secondary/5 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/10 border border-secondary/20 mb-6"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            <Heart className="w-4 h-4 text-secondary fill-secondary" />
            <span className="font-accent text-sm tracking-wider text-secondary">Wedding Season 2024</span>
          </motion.div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            <span className="text-secondary italic">Bridal</span>{' '}
            <span className="text-foreground">Collection</span>
          </h2>
          
          <p className="font-body text-muted-foreground max-w-2xl mx-auto text-base md:text-lg italic">
            Begin your forever with our exquisite bridal jewellery, handcrafted to make your special day unforgettable.
          </p>
        </motion.div>

        {/* Main Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Main Large Feature Card - Left Side */}
          <motion.div 
            className="col-span-12 lg:col-span-5 row-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative group h-full min-h-[500px] md:min-h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-rose-50">
              {/* Background Image */}
              <img 
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=1000&fit=crop"
                alt="Royal Heritage Bridal Collection"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
              
              {/* Limited Edition Badge */}
              <motion.div 
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-background/95 backdrop-blur-sm shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="font-accent text-sm font-medium">Limited Edition</span>
              </motion.div>

              {/* Decorative Dot */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-background/80 backdrop-blur-sm border-2 border-background" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="font-display text-3xl md:text-4xl text-background mb-2">Royal Heritage</h3>
                <p className="font-body text-background/80 mb-4">Complete bridal ensemble</p>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-display text-2xl md:text-3xl text-accent">{formatPrice(89999)}</span>
                  <span className="text-background/60 line-through text-lg">{formatPrice(119999)}</span>
                  <span className="px-3 py-1.5 bg-secondary rounded-full text-xs font-bold text-secondary-foreground">
                    25% OFF
                  </span>
                </div>
              </div>
              
              {/* Decorative Borders */}
              <div className="absolute -inset-1 border border-secondary/20 rounded-[1.75rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>

          {/* Right Side Gallery - 2x2 Grid */}
          <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4 md:gap-6">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                className="relative group aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                
                {/* View Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <ArrowRight className="w-5 h-5 text-foreground" />
                  </div>
                </div>

                {/* Decorative Border */}
                <div className="absolute inset-0 border border-background/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div 
          className="text-center mt-12 md:mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/collections/bridal-heritage">
            <Button 
              variant="outline" 
              size="lg" 
              className="group px-8 py-6 rounded-full border-2 border-foreground/20 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <Heart className="w-5 h-5 mr-2 group-hover:fill-current transition-all" />
              <span className="font-medium tracking-wide">EXPLORE BRIDAL COLLECTION</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-8 mt-12 text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-sm">4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-secondary" />
            <span className="text-sm">5000+ Happy Brides</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">Lifetime Exchange</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WeddingCollectionShowcase;
