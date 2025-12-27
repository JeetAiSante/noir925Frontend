import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useFestivalTheme } from '@/context/FestivalThemeContext';

const FloatingFestivalBanner = () => {
  const { activeTheme } = useFestivalTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // Show banner when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 300 && !isDismissed) {
        setIsVisible(true);
      } else if (scrollY <= 200) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  // Countdown timer
  useEffect(() => {
    if (!activeTheme?.end_date) return;

    const updateCountdown = () => {
      const end = new Date(activeTheme.end_date!).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [activeTheme?.end_date]);

  if (!activeTheme || !activeTheme.show_floating_banner || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('festivalBannerDismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40"
          style={{
            background: `linear-gradient(135deg, ${activeTheme.primary_color}ee, ${activeTheme.secondary_color}ee)`,
          }}
          role="banner"
          aria-label="Festival sale notification"
        >
          <div className="relative rounded-xl p-4 backdrop-blur-sm border border-white/20 shadow-2xl">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:bg-foreground transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: activeTheme.accent_color }}
              >
                <Sparkles className="w-5 h-5 text-background" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-background font-semibold text-sm truncate">
                  {activeTheme.name} Sale
                </h4>
                <p className="text-background/80 text-xs mt-0.5">
                  {activeTheme.floating_banner_text || activeTheme.special_offer || `Up to ${activeTheme.discount_percent}% OFF`}
                </p>

                {/* Countdown */}
                {activeTheme.end_date && (
                  <div className="flex items-center gap-1 mt-2 text-background/90">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-medium">
                      Ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <Link
              to={`/festival/${activeTheme.slug}`}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: activeTheme.accent_color,
                color: '#ffffff',
              }}
            >
              Shop Now
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingFestivalBanner;
