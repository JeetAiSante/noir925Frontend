import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Crown, Heart } from 'lucide-react';

const GenderShopSection = () => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-3">
            Shop for <span className="text-primary">Him</span> & <span className="text-secondary">Her</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Curated silver collections designed to complement every style
          </p>
        </motion.div>

        {/* Him/Her Cards - Responsive Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Gifts for Him */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group"
          >
            <Link to="/shop?gender=men" className="block">
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[3/4]">
                {/* Background Image - Handsome man with silver jewelry */}
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face"
                  alt="Men's Silver Jewelry Collection"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
                
                {/* Decorative Frame - Hidden on mobile */}
                <div className="hidden sm:block absolute inset-3 md:inset-6 border border-background/20 rounded-xl md:rounded-2xl pointer-events-none" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6 text-center pb-6 sm:pb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="mb-2 sm:mb-3"
                  >
                    <Crown className="w-6 h-6 sm:w-8 md:w-10 sm:h-8 md:h-10 text-accent" />
                  </motion.div>
                  <h3 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-background mb-1 sm:mb-2">HIM</h3>
                  <p className="text-background/70 text-xs sm:text-sm mb-3 sm:mb-4 max-w-[150px] sm:max-w-[180px]">
                    Bold & Masculine Silver
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-background/90 backdrop-blur-sm rounded-full text-foreground text-xs sm:text-sm font-medium hover:bg-background transition-colors"
                  >
                    Shop Men
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Gifts for Her */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <Link to="/shop?gender=women" className="block">
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[3/4]">
                {/* Background Image - Beautiful woman with silver jewelry */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=face"
                  alt="Women's Silver Jewelry Collection"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/30 to-transparent" />
                
                {/* Decorative Frame - Hidden on mobile */}
                <div className="hidden sm:block absolute inset-3 md:inset-6 border border-background/20 rounded-xl md:rounded-2xl pointer-events-none" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6 text-center pb-6 sm:pb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="mb-2 sm:mb-3"
                  >
                    <Heart className="w-6 h-6 sm:w-8 md:w-10 sm:h-8 md:h-10 text-secondary fill-current" />
                  </motion.div>
                  <h3 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-background mb-1 sm:mb-2">HER</h3>
                  <p className="text-background/70 text-xs sm:text-sm mb-3 sm:mb-4 max-w-[150px] sm:max-w-[180px]">
                    Elegant & Timeless
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-background/90 backdrop-blur-sm rounded-full text-foreground text-xs sm:text-sm font-medium hover:bg-background transition-colors"
                  >
                    Shop Women
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GenderShopSection;
