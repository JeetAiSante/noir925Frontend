import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, ArrowRight, Percent, Star, Clock } from 'lucide-react';
import { useFestivalTheme } from '@/context/FestivalThemeContext';
import OptimizedImage from '@/components/ui/optimized-image';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const FestivalBanner = () => {
  const { activeTheme, isLoading } = useFestivalTheme();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown timer effect
  useEffect(() => {
    if (!activeTheme?.end_date) return;

    const calculateTimeLeft = () => {
      const endDate = new Date(activeTheme.end_date!).getTime();
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
  }, [activeTheme?.end_date]);

  if (isLoading || !activeTheme) {
    return null;
  }

  const hasTimeLeft = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  return (
    <section className="relative py-6 md:py-10 overflow-hidden" aria-label={`${activeTheme.name} Festival Sale`}>
      {/* Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, ${activeTheme.primary_color}15 0%, ${activeTheme.secondary_color}10 40%, ${activeTheme.accent_color}15 100%)` 
        }}
      />
      
      {/* Animated Sparkle Particles - Reduced for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          >
            <Star 
              className="w-2 h-2 md:w-3 md:h-3" 
              style={{ color: i % 2 === 0 ? activeTheme.primary_color : activeTheme.accent_color }}
              fill={i % 2 === 0 ? "currentColor" : "none"}
            />
          </motion.div>
        ))}
      </div>

      {/* Glowing Corner Effects */}
      <motion.div 
        className="absolute -top-16 -left-16 w-40 h-40 rounded-full blur-3xl opacity-30"
        style={{ background: activeTheme.primary_color }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div 
        className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30"
        style={{ background: activeTheme.accent_color }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8"
        >
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
              style={{ 
                backgroundColor: `${activeTheme.primary_color}15`,
                border: `1px solid ${activeTheme.primary_color}30`
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="w-3 h-3" style={{ color: activeTheme.primary_color }} />
              <span 
                className="text-[10px] md:text-xs font-semibold uppercase tracking-wider"
                style={{ color: activeTheme.primary_color }}
              >
                Limited Time Offer
              </span>
            </motion.div>
            
            <motion.h2 
              className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              {activeTheme.name}
            </motion.h2>
            
            {activeTheme.special_offer && (
              <motion.p 
                className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto lg:mx-0 mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                {activeTheme.special_offer}
              </motion.p>
            )}

            {/* Countdown Timer */}
            {hasTimeLeft && activeTheme.end_date && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="mb-4"
              >
                <div className="flex items-center justify-center lg:justify-start gap-1 text-muted-foreground text-xs mb-2">
                  <Clock className="w-3 h-3" style={{ color: activeTheme.primary_color }} />
                  <span>Sale ends in</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  {[
                    { value: timeLeft.days, label: 'D' },
                    { value: timeLeft.hours, label: 'H' },
                    { value: timeLeft.minutes, label: 'M' },
                    { value: timeLeft.seconds, label: 'S' },
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-0.5"
                    >
                      <div 
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-sm md:text-base font-bold shadow-sm"
                        style={{ 
                          background: `linear-gradient(145deg, ${activeTheme.primary_color}20, ${activeTheme.accent_color}15)`,
                          border: `1px solid ${activeTheme.primary_color}20`,
                          color: activeTheme.primary_color
                        }}
                      >
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
                      {index < 3 && <span className="text-muted-foreground/50 mx-0.5">:</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link to={`/festival/${activeTheme.slug}`}>
                <Button 
                  size="sm"
                  className="group gap-2 px-5 py-4 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{ 
                    background: `linear-gradient(135deg, ${activeTheme.primary_color}, ${activeTheme.accent_color})`,
                    color: 'white',
                    boxShadow: `0 6px 25px ${activeTheme.primary_color}40`
                  }}
                >
                  <Gift className="w-4 h-4" aria-hidden="true" />
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
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
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="relative order-first lg:order-none"
            >
              {/* Rotating border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-1.5 rounded-full"
                style={{ 
                  border: `2px dashed ${activeTheme.primary_color}40`,
                }}
              />
              
              {/* Pulsing glow */}
              <motion.div
                className="absolute inset-0 rounded-full blur-lg"
                style={{ background: activeTheme.primary_color }}
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.9, 1.05, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Main badge */}
              <div 
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center text-center shadow-xl"
                style={{ 
                  background: `linear-gradient(145deg, ${activeTheme.primary_color}, ${activeTheme.accent_color})`,
                  boxShadow: `0 10px 40px ${activeTheme.primary_color}40, inset 0 -3px 12px rgba(0,0,0,0.2)`
                }}
              >
                <Percent className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                <span className="text-2xl md:text-3xl font-display font-bold text-white drop-shadow-md">
                  {activeTheme.discount_percent}
                </span>
                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-white/90">
                  OFF
                </span>
              </div>
            </motion.div>
          )}

          {/* Right: Banner Image */}
          {activeTheme.banner_image && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex-1 relative max-w-xs lg:max-w-sm"
            >
              <div 
                className="absolute -inset-2 rounded-xl blur-xl opacity-30"
                style={{ background: `linear-gradient(135deg, ${activeTheme.primary_color}, ${activeTheme.accent_color})` }}
              />
              <div className="relative rounded-xl overflow-hidden shadow-xl border border-white/10">
                <OptimizedImage 
                  src={activeTheme.banner_image} 
                  alt={`${activeTheme.name} - Festival jewellery collection`}
                  className="w-full h-32 md:h-40 lg:h-48 object-cover"
                  fallback="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop"
                />
                {/* Overlay gradient */}
                <div 
                  className="absolute inset-0 opacity-15"
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
