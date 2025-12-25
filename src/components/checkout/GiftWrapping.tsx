import { useState } from 'react';
import { Gift, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GiftWrappingProps {
  onGiftWrapChange: (selected: boolean) => void;
  giftWrapCost: number;
}

const GiftWrapping = ({ onGiftWrapChange, giftWrapCost = 149 }: GiftWrappingProps) => {
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  const handleToggle = () => {
    const newValue = !isGiftWrap;
    setIsGiftWrap(newValue);
    onGiftWrapChange(newValue);
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl border border-primary/20 overflow-hidden">
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isGiftWrap ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            <Gift className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-display text-lg flex items-center gap-2">
              Is this a Gift?
              <Sparkles className="w-4 h-4 text-accent" />
            </p>
            <p className="text-sm text-muted-foreground">
              Wrap it beautifully for just ₹{giftWrapCost}
            </p>
          </div>
        </div>

        <div className={`w-12 h-7 rounded-full transition-colors relative ${
          isGiftWrap ? 'bg-primary' : 'bg-muted'
        }`}>
          <motion.div
            animate={{ x: isGiftWrap ? 22 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-5 h-5 rounded-full bg-background shadow-lg flex items-center justify-center"
          >
            {isGiftWrap && <Check className="w-3 h-3 text-primary" />}
          </motion.div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isGiftWrap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Gift Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Premium Box</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Satin Ribbon</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Gift Card</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">No Price Tag</span>
                </div>
              </div>

              {/* Gift Message */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add a Personal Message (Optional)
                </label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Write your heartfelt message here..."
                  maxLength={150}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {giftMessage.length}/150 characters
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 bg-card rounded-xl border border-primary/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Gift Wrap Preview
                </p>
                <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <div className="text-center">
                    <Gift className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Elegantly wrapped with love
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftWrapping;