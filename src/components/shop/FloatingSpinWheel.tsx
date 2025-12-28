import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import SpinWheelPopup from '@/components/popups/SpinWheelPopup';

const FloatingSpinWheel = () => {
  const [showButton, setShowButton] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user dismissed the button in this session
    const wasDismissed = sessionStorage.getItem('spinWheelDismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Check if user has already spun today
    const lastSpinDate = localStorage.getItem('spinWheelLastSpin');
    if (lastSpinDate) {
      const lastSpin = new Date(lastSpinDate);
      const today = new Date();
      if (lastSpin.toDateString() === today.toDateString()) {
        // User already spun today - hide the button
        setDismissed(true);
        return;
      }
    }

    // Show button after a short delay
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem('spinWheelDismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <>
      <AnimatePresence>
        {showButton && !isPopupOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-4 z-40 md:bottom-8"
          >
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shadow-md hover:bg-muted transition-colors z-10"
              aria-label="Dismiss spin wheel"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Main button */}
            <motion.button
              onClick={() => setIsPopupOpen(true)}
              className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary/90 to-accent shadow-xl flex items-center justify-center group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pulse rings */}
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              <span className="absolute inset-1 rounded-full bg-primary/20 animate-pulse" />
              
              {/* Icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Gift className="w-7 h-7 text-primary-foreground" />
              </motion.div>
            </motion.button>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
                <p className="text-xs font-medium text-foreground">Spin & Win!</p>
                <p className="text-[10px] text-muted-foreground">Win up to 25% off</p>
              </div>
              {/* Arrow */}
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-card border-r border-b border-border rotate-[-45deg]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SpinWheelPopup open={isPopupOpen} onOpenChange={setIsPopupOpen} />
    </>
  );
};

export default FloatingSpinWheel;
