import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const GenderShopSection = () => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-muted/30 via-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-3">
            Shop by <span className="text-primary">Style</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Curated silver collections designed to complement every personality
          </p>
        </motion.div>

        {/* Him/Her Cards - Arch Style */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 max-w-3xl mx-auto">
          {/* For Him - Arch Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group"
          >
            <Link to="/shop?gender=men" className="block">
              <div className="relative">
                {/* Arch Frame */}
                <div 
                  className="relative overflow-hidden bg-gradient-to-b from-blue-100/80 via-blue-50/60 to-white/40 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-background/50 p-2 sm:p-3"
                  style={{
                    borderRadius: '50% 50% 8px 8px / 30% 30% 4% 4%',
                  }}
                >
                  {/* Inner Arch with Image */}
                  <div 
                    className="relative overflow-hidden aspect-[3/4]"
                    style={{
                      borderRadius: '50% 50% 6px 6px / 35% 35% 3% 3%',
                    }}
                  >
                    {/* Background Image - Stylish man with silver jewelry */}
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop&crop=face"
                      alt="Men's Silver Jewelry Collection - Handsome man wearing silver accessories"
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Soft Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-blue-100/10" />
                    
                    {/* Sparkle Effects */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-white/80 rounded-full animate-pulse" />
                    <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse delay-300" />
                    <div className="absolute bottom-16 left-4 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-500" />
                  </div>
                </div>

                {/* Label Below Arch */}
                <div className="text-center mt-4 sm:mt-6">
                  <h3 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground mb-1 uppercase tracking-wider">
                    For Him
                  </h3>
                  <p className="text-muted-foreground text-[10px] sm:text-xs mb-3 hidden sm:block">
                    Bold & Masculine Silver
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-full text-foreground text-[10px] sm:text-xs font-medium transition-all border border-primary/20"
                  >
                    Shop Now
                    <ArrowRight className="w-3 h-3" />
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* For Her - Arch Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <Link to="/shop?gender=women" className="block">
              <div className="relative">
                {/* Arch Frame */}
                <div 
                  className="relative overflow-hidden bg-gradient-to-b from-pink-100/80 via-rose-50/60 to-white/40 dark:from-pink-900/30 dark:via-rose-800/20 dark:to-background/50 p-2 sm:p-3"
                  style={{
                    borderRadius: '50% 50% 8px 8px / 30% 30% 4% 4%',
                  }}
                >
                  {/* Inner Arch with Image */}
                  <div 
                    className="relative overflow-hidden aspect-[3/4]"
                    style={{
                      borderRadius: '50% 50% 6px 6px / 35% 35% 3% 3%',
                    }}
                  >
                    {/* Background Image - Beautiful woman with silver jewelry */}
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=700&fit=crop&crop=face"
                      alt="Women's Silver Jewelry Collection - Beautiful woman wearing elegant silver jewelry"
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Soft Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 via-transparent to-pink-100/10" />
                    
                    {/* Sparkle Effects */}
                    <div className="absolute top-4 left-4 w-2 h-2 bg-white/80 rounded-full animate-pulse" />
                    <div className="absolute top-12 left-8 w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse delay-200" />
                    <div className="absolute bottom-20 right-6 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-700" />
                  </div>
                </div>

                {/* Label Below Arch */}
                <div className="text-center mt-4 sm:mt-6">
                  <h3 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground mb-1 uppercase tracking-wider">
                    For Her
                  </h3>
                  <p className="text-muted-foreground text-[10px] sm:text-xs mb-3 hidden sm:block">
                    Elegant & Timeless
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary/10 hover:bg-secondary hover:text-secondary-foreground rounded-full text-foreground text-[10px] sm:text-xs font-medium transition-all border border-secondary/20"
                  >
                    Shop Now
                    <ArrowRight className="w-3 h-3" />
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