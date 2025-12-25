import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Crown } from 'lucide-react';

const GenderShopSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-secondary/5 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <Heart className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Be Their Secret Santa</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
            Gifts for <span className="text-primary">Everyone</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the perfect piece for him or her from our curated collections
          </p>
        </motion.div>

        {/* Him/Her Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Gifts for Him */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group"
          >
            <Link to="/shop?gender=men" className="block">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] md:aspect-[3/4]">
                {/* Background Image */}
                <img
                  src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&h=800&fit=crop"
                  alt="Gifts for Him"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                
                {/* Decorative Frame */}
                <div className="absolute inset-4 md:inset-8 border-2 border-background/20 rounded-2xl pointer-events-none" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="mb-4"
                  >
                    <Crown className="w-10 h-10 text-accent" />
                  </motion.div>
                  <h3 className="font-display text-4xl md:text-6xl text-background mb-2">HIM</h3>
                  <p className="text-background/70 text-sm md:text-base mb-6 max-w-[200px]">
                    Bold & Masculine Silver Pieces
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-background/90 backdrop-blur-sm rounded-full text-foreground font-medium hover:bg-background transition-colors"
                  >
                    Gifts for Him
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute top-8 right-8"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="w-16 h-16 rounded-full bg-accent/20 backdrop-blur-sm" />
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Gifts for Her */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <Link to="/shop?gender=women" className="block">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] md:aspect-[3/4]">
                {/* Background Image */}
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop"
                  alt="Gifts for Her"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent" />
                
                {/* Decorative Frame */}
                <div className="absolute inset-4 md:inset-8 border-2 border-background/20 rounded-2xl pointer-events-none" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="mb-4"
                  >
                    <Heart className="w-10 h-10 text-secondary fill-current" />
                  </motion.div>
                  <h3 className="font-display text-4xl md:text-6xl text-background mb-2">HER</h3>
                  <p className="text-background/70 text-sm md:text-base mb-6 max-w-[200px]">
                    Elegant & Timeless Collections
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-background/90 backdrop-blur-sm rounded-full text-foreground font-medium hover:bg-background transition-colors"
                  >
                    Gifts for Her
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute top-8 left-8"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-16 h-16 rounded-full bg-secondary/30 backdrop-blur-sm" />
                </motion.div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Bottom CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          <Link 
            to="/shop?category=couples"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary via-accent to-secondary text-white rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <Heart className="w-4 h-4" />
            Couple Collections
          </Link>
          <Link 
            to="/shop?category=unisex"
            className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-full font-medium hover:bg-muted/80 transition-colors border border-border/50"
          >
            Unisex Designs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default GenderShopSection;
