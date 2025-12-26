import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, ArrowRight } from 'lucide-react';
import { useFestivalTheme } from '@/context/FestivalThemeContext';

const FestivalBanner = () => {
  const { activeTheme, isLoading } = useFestivalTheme();

  if (isLoading || !activeTheme) {
    return null;
  }

  return (
    <section className="relative py-8 md:py-12 overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, ${activeTheme.primary_color}15 0%, ${activeTheme.secondary_color}15 50%, ${activeTheme.accent_color}15 100%)` 
        }}
      />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ 
              background: i % 2 === 0 ? activeTheme.primary_color : activeTheme.accent_color,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Decorative Corner Elements */}
      <div 
        className="absolute top-0 left-0 w-32 h-32 opacity-30"
        style={{ 
          background: `radial-gradient(circle at top left, ${activeTheme.primary_color}40, transparent 70%)` 
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-40 h-40 opacity-30"
        style={{ 
          background: `radial-gradient(circle at bottom right, ${activeTheme.accent_color}40, transparent 70%)` 
        }}
      />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8"
        >
          {/* Left: Festival Info */}
          <div className="flex items-center gap-4 md:gap-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 md:p-4 rounded-xl"
              style={{ backgroundColor: `${activeTheme.primary_color}20` }}
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10" style={{ color: activeTheme.primary_color }} />
            </motion.div>
            
            <div>
              <motion.p 
                className="text-xs md:text-sm font-body uppercase tracking-widest mb-1"
                style={{ color: activeTheme.primary_color }}
              >
                Limited Time Offer
              </motion.p>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground">
                {activeTheme.name}
              </h2>
              {activeTheme.special_offer && (
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  {activeTheme.special_offer}
                </p>
              )}
            </div>
          </div>

          {/* Center: Discount Badge */}
          {activeTheme.discount_percent && (
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed opacity-30"
                style={{ borderColor: activeTheme.accent_color }}
              />
              <div 
                className="relative w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center text-center shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${activeTheme.primary_color}, ${activeTheme.accent_color})`,
                  boxShadow: `0 10px 40px ${activeTheme.primary_color}40`
                }}
              >
                <span className="text-2xl md:text-3xl font-display font-bold text-white">
                  {activeTheme.discount_percent}%
                </span>
                <span className="text-xs font-body uppercase tracking-wider text-white/90">
                  OFF
                </span>
              </div>
            </motion.div>
          )}

          {/* Right: CTA */}
          <div className="flex items-center gap-4">
            <Link to={`/festival/${activeTheme.slug}`}>
              <Button 
                size="lg"
                className="group gap-2 px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ 
                  background: `linear-gradient(135deg, ${activeTheme.primary_color}, ${activeTheme.accent_color})`,
                  color: 'white'
                }}
              >
                <Gift className="w-4 h-4" aria-hidden="true" />
                <span className="font-display">Explore Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Banner Image (if available) */}
        {activeTheme.banner_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 rounded-2xl overflow-hidden shadow-luxury"
          >
            <img 
              src={activeTheme.banner_image} 
              alt={activeTheme.name}
              className="w-full h-48 md:h-64 object-cover"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FestivalBanner;
