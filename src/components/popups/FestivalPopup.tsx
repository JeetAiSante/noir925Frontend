import { useState, useEffect } from 'react';
import { X, Sparkles, Gift, ArrowRight, Clock, Percent } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useFestivalTheme } from '@/context/FestivalThemeContext';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface FestivalPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FestivalPopup = ({ open, onOpenChange }: FestivalPopupProps) => {
  const { activeTheme } = useFestivalTheme();
  const isMobile = useIsMobile();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!activeTheme?.end_date) return;

    const calculateTime = () => {
      const endDate = new Date(activeTheme.end_date!);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [activeTheme?.end_date]);

  if (!activeTheme) return null;

  const primaryColor = activeTheme.primary_color || '#D4AF37';
  const secondaryColor = activeTheme.secondary_color || '#1a1a2e';
  const accentColor = activeTheme.accent_color || '#ff6b6b';

  // Mobile-optimized layout
  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] p-0 gap-0 overflow-hidden border-0 rounded-2xl shadow-2xl">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Mobile Header - Compact */}
          <div 
            className="relative p-5 text-center overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
            }}
          >
            {/* Floating particles */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ 
                    background: accentColor,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </motion.div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3"
                style={{ background: `${accentColor}30` }}
              >
                <Gift className="w-7 h-7" style={{ color: accentColor }} />
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-display text-2xl font-bold text-white mb-1"
              >
                {activeTheme.name}
              </motion.h2>
              
              {activeTheme.discount_percent && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white font-bold text-lg"
                  style={{ background: accentColor }}
                >
                  <Percent className="w-4 h-4" />
                  Up to {activeTheme.discount_percent}% OFF
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Content */}
          <div className="p-5 space-y-4 bg-card">
            {/* Countdown */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Ends in</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hrs' },
                { value: timeLeft.minutes, label: 'Min' },
                { value: timeLeft.seconds, label: 'Sec' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center p-2 rounded-xl"
                  style={{ background: `${primaryColor}15` }}
                >
                  <div className="font-display text-xl font-bold" style={{ color: primaryColor }}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {activeTheme.special_offer && (
              <p className="text-center text-sm text-muted-foreground">
                {activeTheme.special_offer}
              </p>
            )}

            <Button
              asChild
              className="w-full h-12 rounded-xl font-semibold text-base gap-2"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                color: 'white'
              }}
              onClick={() => onOpenChange(false)}
            >
              <Link to={`/festival/${activeTheme.slug}`}>
                Shop Festival
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop layout - Premium design
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-0 rounded-3xl shadow-2xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with gradient */}
        <div 
          className="relative p-8 text-center overflow-hidden min-h-[200px] flex flex-col items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor} 60%, ${accentColor})` 
          }}
        >
          {/* Animated background elements */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, ${accentColor}40 0%, transparent 50%), 
                               radial-gradient(circle at 80% 80%, ${primaryColor}40 0%, transparent 50%)`
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Floating sparkles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                x: [-10, 10, -10],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              <Sparkles className="w-3 h-3 text-white/60" />
            </motion.div>
          ))}

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm"
              style={{ background: `${accentColor}40`, border: `2px solid ${accentColor}60` }}
            >
              <Gift className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-display text-4xl font-bold text-white mb-2 tracking-wide"
            >
              {activeTheme.name}
            </motion.h2>
            
            {activeTheme.discount_percent && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.4 }}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-white font-bold text-xl shadow-lg"
                style={{ 
                  background: accentColor,
                  boxShadow: `0 8px 32px ${accentColor}60`
                }}
              >
                <Percent className="w-5 h-5" />
                Up to {activeTheme.discount_percent}% OFF
              </motion.div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 bg-card">
          {/* Countdown */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="uppercase tracking-widest">Offer ends in</span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Minutes' },
                { value: timeLeft.seconds, label: 'Seconds' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center p-4 rounded-2xl border"
                  style={{ 
                    background: `${primaryColor}08`,
                    borderColor: `${primaryColor}20`
                  }}
                >
                  <motion.div 
                    className="font-display text-3xl font-bold"
                    style={{ color: primaryColor }}
                    key={item.value}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </motion.div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {activeTheme.special_offer && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-muted-foreground"
            >
              {activeTheme.special_offer}
            </motion.p>
          )}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              asChild
              size="lg"
              className="w-full h-14 rounded-2xl font-semibold text-lg gap-3 shadow-lg hover:shadow-xl transition-all"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                color: 'white'
              }}
              onClick={() => onOpenChange(false)}
            >
              <Link to={`/festival/${activeTheme.slug}`}>
                Shop {activeTheme.name}
                <ArrowRight className="w-6 h-6" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FestivalPopup;
