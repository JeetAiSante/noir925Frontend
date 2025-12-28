import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Gift, Coins, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderSuccessBannerProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  pointsEarned: number;
  customerName?: string;
}

const OrderSuccessBanner = memo(({ 
  isOpen, 
  onClose, 
  orderNumber, 
  pointsEarned,
  customerName 
}: OrderSuccessBannerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-2xl border border-primary/20 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-20 h-20 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative p-6 sm:p-8 text-center">
              {/* Celebration Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              >
                <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-2xl sm:text-3xl text-foreground mb-2"
              >
                Congratulations! 🎉
              </motion.h2>

              {/* Greeting */}
              {customerName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-sm mb-4"
                >
                  Thank you, <span className="text-foreground font-medium">{customerName}</span>!
                </motion.p>
              )}

              {/* Order Number */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
              >
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  Order #{orderNumber}
                </span>
              </motion.div>

              {/* Loyalty Points Section */}
              {pointsEarned > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="font-display text-lg text-amber-600 dark:text-amber-400">
                      Loyalty Reward
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-2xl font-bold text-foreground">
                      +{pointsEarned}
                    </span>
                    <span className="text-muted-foreground ml-1">points earned!</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use your points on your next purchase for exclusive discounts
                  </p>
                </motion.div>
              )}

              {/* Thank You Message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-muted-foreground text-sm mb-6"
              >
                Your order has been placed successfully. We'll send you an email with tracking details soon.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  Continue Shopping
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

OrderSuccessBanner.displayName = 'OrderSuccessBanner';

export default OrderSuccessBanner;
