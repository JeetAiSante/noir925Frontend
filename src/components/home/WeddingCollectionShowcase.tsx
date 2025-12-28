import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, ArrowRight, Star, Diamond } from 'lucide-react';
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
    <section className="py-16 md:py-24 relative overflow-hidden bg-background">
      {/* Luxurious Background Pattern with Edge Fade Effect */}
      <div className="absolute inset-0">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        
        {/* Left edge fade effect */}
        <div className="absolute inset-y-0 left-0 w-32 md:w-48 lg:w-64 bg-gradient-to-r from-background via-background/80 to-transparent z-[1]" />
        
        {/* Right edge fade effect */}
        <div className="absolute inset-y-0 right-0 w-32 md:w-48 lg:w-64 bg-gradient-to-l from-background via-background/80 to-transparent z-[1]" />
        
        {/* Top edge fade for seamless transition */}
        <div className="absolute inset-x-0 top-0 h-24 md:h-32 bg-gradient-to-b from-background via-background/60 to-transparent z-[1]" />
        
        {/* Bottom edge fade for seamless transition */}
        <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-t from-background via-background/60 to-transparent z-[1]" />
        
        {/* Decorative ornamental pattern - transparent luxury effect */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="bridal-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" className="text-foreground" />
              <path d="M0 10 Q5 5, 10 10 T20 10" stroke="currentColor" fill="none" strokeWidth="0.3" className="text-foreground" />
              <path d="M10 0 Q5 5, 10 10 T10 20" stroke="currentColor" fill="none" strokeWidth="0.3" className="text-foreground" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#bridal-pattern)" />
          </svg>
        </div>

        {/* Soft glowing orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/5 blur-[150px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/10 border border-secondary/30 mb-6"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            <Heart className="w-4 h-4 text-secondary fill-secondary" />
            <span className="font-accent text-sm tracking-widest uppercase text-secondary">Wedding Season 2024</span>
          </motion.div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary/80 to-secondary">Bridal</span>
            <span className="text-foreground ml-3">Collection</span>
          </h2>
          
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 my-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-secondary/50" />
            <Diamond className="w-4 h-4 text-secondary" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-secondary/50" />
          </div>
          
          <p className="font-body text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
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
            <div className="relative group h-full min-h-[500px] md:min-h-[600px] rounded-3xl overflow-hidden border border-border/30 shadow-lg">
              {/* Background Image */}
              <img 
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=1000&fit=crop"
                alt="Royal Heritage Bridal Collection"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/50 to-transparent" />
              
              {/* Limited Edition Badge */}
              <motion.div 
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-background/95 backdrop-blur-sm shadow-lg border border-secondary/30"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                <span className="font-accent text-sm font-semibold text-foreground tracking-wide">Limited Edition</span>
              </motion.div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                <div className="absolute top-4 -right-8 w-32 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground text-xs py-1 rotate-45 text-center font-medium tracking-wide">
                  BRIDAL
                </div>
              </div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-0.5 bg-secondary" />
                  <span className="text-secondary/80 text-xs tracking-widest uppercase font-medium">Exclusive Design</span>
                </div>
                
                <h3 className="font-display text-3xl md:text-4xl text-background mb-2 tracking-wide">Royal Heritage</h3>
                <p className="font-body text-background/70 mb-4">Complete bridal ensemble</p>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-display text-2xl md:text-3xl text-secondary">{formatPrice(89999)}</span>
                  <span className="text-background/50 line-through text-lg">{formatPrice(119999)}</span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-secondary to-secondary/80 rounded-full text-xs font-bold text-secondary-foreground tracking-wide">
                    25% OFF
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side Gallery - 2x2 Grid */}
          <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4 md:gap-6">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                className="relative group aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-border/20 shadow-md"
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
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                
                {/* Secondary accent border on hover */}
                <div className="absolute inset-0 border-2 border-secondary/0 group-hover:border-secondary/50 rounded-2xl transition-all duration-300" />
                
                {/* View Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                    <ArrowRight className="w-5 h-5 text-secondary-foreground" />
                  </div>
                </div>
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
              size="lg" 
              className="group px-10 py-6 rounded-full bg-gradient-to-r from-secondary via-secondary/90 to-secondary hover:from-secondary/90 hover:via-secondary/80 hover:to-secondary/90 text-secondary-foreground border-0 shadow-lg transition-all duration-300"
            >
              <Heart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold tracking-wider">EXPLORE BRIDAL COLLECTION</span>
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
            <Star className="w-4 h-4 text-secondary fill-secondary" />
            <span className="text-sm">4.9/5 Rating</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-secondary" />
            <span className="text-sm">5000+ Happy Brides</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm">Lifetime Exchange</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WeddingCollectionShowcase;
