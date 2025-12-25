import { useState } from 'react';
import { X, Gift, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface DiscountPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DiscountPopup = ({ open, onOpenChange }: DiscountPopupProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Welcome! Use code NOIR15 for 15% off!');
      localStorage.setItem('noir925_subscribed', 'true');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm p-0 gap-0 overflow-hidden bg-card border-primary/10 shadow-luxury">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-10 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Decorative Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-5 text-center text-primary-foreground overflow-hidden">
          <Sparkles className="absolute top-3 left-3 w-4 h-4 opacity-40 animate-pulse" />
          <Sparkles className="absolute bottom-3 right-3 w-3 h-3 opacity-30 animate-pulse delay-300" />
          
          <div className="relative">
            <div className="w-14 h-14 mx-auto rounded-full bg-white/10 backdrop-blur flex items-center justify-center mb-3 ring-2 ring-white/20">
              <Gift className="w-7 h-7" />
            </div>
            <div className="text-3xl font-display font-bold mb-0.5">15% OFF</div>
            <p className="text-xs opacity-90">Your First Order</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="text-center">
            <h3 className="font-display text-base mb-0.5">Join NOIR925 Family</h3>
            <p className="text-xs text-muted-foreground">
              Get exclusive deals & style tips
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-10 bg-muted/50 border-0 text-sm"
                required
              />
            </div>

            <Button
              type="submit"
              size="sm"
              className="w-full h-10 gap-2 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <>
                  Claim 15% Off
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-[10px] text-center text-muted-foreground">
            By subscribing, you agree to receive marketing emails
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountPopup;
