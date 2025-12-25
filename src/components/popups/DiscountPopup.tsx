import { useState } from 'react';
import { X, Gift, Sparkles, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Welcome! Your 15% discount code: NOIR15', {
      description: 'Use it at checkout for your first order.',
      duration: 10000,
    });
    
    localStorage.setItem('noir925_subscribed', 'true');
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image Side */}
          <div className="hidden md:block relative h-full min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop"
              alt="Silver Jewelry"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-background">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8" />
                </div>
                <p className="font-display text-5xl font-bold">15%</p>
                <p className="text-lg mt-2">OFF</p>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="p-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
                <Sparkles className="w-4 h-4" />
                Exclusive Offer
              </div>
              
              <h2 className="font-display text-2xl md:text-3xl mb-3">
                Get 15% Off Your First Order
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Join our exclusive community and receive a special discount on your first purchase of handcrafted 925 silver jewelry.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-11 h-12"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  variant="luxury" 
                  className="w-full h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Subscribing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Claim My 15% Off
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground mt-4 text-center md:text-left">
                By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountPopup;