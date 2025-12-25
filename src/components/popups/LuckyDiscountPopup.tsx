import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, Copy, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLuckyDiscount } from '@/hooks/useLuckyDiscount';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const LuckyDiscountPopup = () => {
  const { user } = useAuth();
  const { checkEligibility, claimDiscount, loginTime } = useLuckyDiscount();
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof checkEligibility> | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [claimedCode, setClaimedCode] = useState('');

  useEffect(() => {
    if (user) {
      // Small delay to ensure discounts are loaded
      const timer = setTimeout(() => {
        const eligibility = checkEligibility();
        if (eligibility.isEligible || eligibility.luckyNumber) {
          setResult(eligibility);
          // Only show popup if user just logged in (within last 30 seconds)
          const loginAge = Date.now() - loginTime.getTime();
          if (loginAge < 30000) {
            setIsOpen(true);
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, checkEligibility, loginTime]);

  const handleClaim = async () => {
    if (!result?.discount || !result.luckyNumber) return;

    const claim = await claimDiscount(result.discount.id, result.luckyNumber);
    if (claim) {
      setClaimed(true);
      setClaimedCode(claim.discount_code);
      
      // Send email notification
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', user?.id)
          .single();
        
        if (profile?.email) {
          await supabase.functions.invoke('send-lucky-discount-email', {
            body: {
              email: profile.email,
              name: profile.full_name || 'Valued Customer',
              discountCode: claim.discount_code,
              discountPercent: result.discount.discount_percent,
              expiresAt: claim.expires_at,
              minOrderValue: result.discount.min_order_value || 0,
            },
          });
          toast.success('Discount claimed! Code sent to your email.');
        } else {
          toast.success('Discount claimed! Code copied to clipboard.');
        }
      } catch (error) {
        console.error('Error sending email:', error);
        toast.success('Discount claimed! Code copied to clipboard.');
      }
    } else {
      toast.error('Failed to claim discount. Please try again.');
    }
  };

  const copyCode = () => {
    const code = claimed ? claimedCode : result?.discount?.discount_code;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success('Code copied to clipboard!');
    }
  };

  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-gradient-to-br from-primary/90 via-accent/90 to-secondary/90 rounded-2xl p-6 text-center"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/20 hover:bg-background/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Floating Sparkles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Sparkles className="w-3 h-3 text-white/50" />
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {result.isEligible ? (
              <>
                {/* Lucky Winner Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-background/20 flex items-center justify-center"
                >
                  <Gift className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-3xl text-white mb-2"
                >
                  🎉 You're Lucky!
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 mb-4"
                >
                  Your lucky number <span className="font-bold text-white">{result.luckyNumber}</span> won you a special discount!
                </motion.p>

                {/* Discount Display */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-background/20 backdrop-blur-sm rounded-xl p-4 mb-4"
                >
                  <p className="text-white/70 text-sm mb-1">{result.discount?.name}</p>
                  <p className="font-display text-4xl text-white">
                    {result.discount?.discount_percent}% OFF
                  </p>
                  {result.discount?.min_order_value && result.discount.min_order_value > 0 && (
                    <p className="text-white/60 text-xs mt-1">
                      Min. order: ₹{result.discount.min_order_value}
                    </p>
                  )}
                </motion.div>

                {/* Code Section */}
                {claimed || result.discount?.discount_code ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-4"
                  >
                    <p className="text-white/70 text-sm mb-2">Your discount code:</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="px-4 py-2 bg-background/30 rounded-lg text-lg font-mono text-white tracking-wider">
                        {claimed ? claimedCode : result.discount?.discount_code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyCode}
                        className="text-white hover:bg-background/20"
                      >
                        {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </motion.div>
                ) : null}

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3 justify-center"
                >
                  {!claimed && (
                    <Button
                      onClick={handleClaim}
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      Claim Discount
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-background/20"
                  >
                    {claimed ? 'Continue Shopping' : 'Maybe Later'}
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                {/* Non-Winner Display */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-background/20 flex items-center justify-center"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="font-display text-2xl text-white mb-2">
                  Your Lucky Number
                </h2>

                <div className="bg-background/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <p className="font-display text-5xl text-white">
                    {result.luckyNumber}
                  </p>
                </div>

                <p className="text-white/80 text-sm mb-4">
                  {result.message}
                </p>

                <Button
                  onClick={() => setIsOpen(false)}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  Continue Shopping
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LuckyDiscountPopup;
