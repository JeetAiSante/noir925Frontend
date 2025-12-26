import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, ArrowRight, Percent, Star, PartyPopper } from 'lucide-react';
import { useFestivalTheme } from '@/context/FestivalThemeContext';

const FestivalBanner = () => {
  const { activeTheme, isLoading } = useFestivalTheme();

  if (isLoading || !activeTheme) {
    return null;
  }

  return (
    <section className="relative py-10 md:py-16 overflow-hidden">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, ${activeTheme.primary_color}20 0%, ${activeTheme.secondary_color}15 40%, ${activeTheme.accent_color}25 100%)` 
        }}
      />
      
      {/* Animated Sparkle Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-10, 10, -10],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.3, 0.8],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          >
            <Star 
              className="w-3 h-3 md:w-4 md:h-4" 
              style={{ color: i % 3 === 0 ? activeTheme.primary_color : i % 3 === 1 ? activeTheme.accent_color : activeTheme.secondary_color }}
              fill={i % 2 === 0 ? "currentColor" : "none"}
            />
          </motion.div>
        ))}
      </div>

      {/* Glowing Corner Effects */}
      <motion.div 
        className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-40"
        style={{ background: activeTheme.primary_color }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div 
        className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-40"
        style={{ background: activeTheme.accent_color }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12"
        >
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ 
                backgroundColor: `${activeTheme.primary_color}20`,
                border: `1px solid ${activeTheme.primary_color}40`
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <PartyPopper className="w-4 h-4" style={{ color: activeTheme.primary_color }} />
              <span 
                className="text-xs md:text-sm font-semibold uppercase tracking-widest"
                style={{ color: activeTheme.primary_color }}
              >
                Limited Time Festival Offer
              </span>
              <Sparkles className="w-4 h-4" style={{ color: activeTheme.accent_color }} />
            </motion.div>
            
            <motion.h2 
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {activeTheme.name}
            </motion.h2>
            
            {activeTheme.special_offer && (
              <motion.p 
                className="text-base md:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                {activeTheme.special_offer}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Link to={`/festival/${activeTheme.slug}`}>
                <Button 
                  size="lg"
                  className="group gap-3 px-8 py-6 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  style={{ 
                    background: `linear-gradient(135deg, ${activeTheme.primary_color}, ${activeTheme.accent_color})`,
                    color: 'white',
                    boxShadow: `0 10px 40px ${activeTheme.primary_color}50`
                  }}
                >
                  <Gift className="w-5 h-5" aria-hidden="true" />
                  <span>Shop Festival Collection</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Center Discount Badge */}
          {activeTheme.discount_percent && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              className="relative"
            >
              {/* Rotating border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 rounded-full"
                style={{ 
                  border: `2px dashed ${activeTheme.primary_color}60`,
                }}
              />
              
              {/* Pulsing glow */}
              <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ background: activeTheme.primary_color }}
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Main badge */}
              <div 
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center text-center shadow-2xl"
                style={{ 
                  background: `linear-gradient(145deg, ${activeTheme.primary_color}, ${activeTheme.accent_color})`,
                  boxShadow: `0 20px 60px ${activeTheme.primary_color}50, inset 0 -5px 20px rgba(0,0,0,0.2)`
                }}
              >
                <Percent className="w-6 h-6 md:w-8 md:h-8 text-white/80 mb-1" />
                <span className="text-4xl md:text-5xl font-display font-bold text-white drop-shadow-lg">
                  {activeTheme.discount_percent}
                </span>
                <span className="text-sm md:text-base font-semibold uppercase tracking-wider text-white/90">
                  OFF
                </span>
              </div>
            </motion.div>
          )}

          {/* Right: Banner Image */}
          {activeTheme.banner_image && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex-1 relative"
            >
              <div 
                className="absolute -inset-4 rounded-2xl blur-2xl opacity-40"
                style={{ background: `linear-gradient(135deg, ${activeTheme.primary_color}, ${activeTheme.accent_color})` }}
              />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src={activeTheme.banner_image} 
                  alt={activeTheme.name}
                  className="w-full h-48 md:h-64 lg:h-72 object-cover"
                  loading="lazy"
                />
                {/* Overlay gradient */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ 
                    background: `linear-gradient(to top, ${activeTheme.primary_color}, transparent)` 
                  }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default FestivalBanner;
