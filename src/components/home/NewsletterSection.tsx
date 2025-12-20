import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Gift, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail('');
    
    toast({
      title: 'Welcome to the family!',
      description: 'Check your inbox for your 15% discount code.',
    });
  };

  const benefits = [
    { icon: Gift, text: '15% off your first order' },
    { icon: Sparkles, text: 'Early access to new collections' },
    { icon: Mail, text: 'Exclusive member-only offers' },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <p className="font-accent text-sm text-primary tracking-widest uppercase mb-2">
              Join Our Community
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
              Get 15% Off Your First Order
            </h2>
            <p className="font-body text-lg text-muted-foreground">
              Subscribe to receive exclusive offers, new collection previews, and styling tips
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <benefit.icon className="w-4 h-4 text-primary" />
                <span className="font-body text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          {isSubscribed ? (
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-primary/10 rounded-full max-w-md mx-auto">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-display text-foreground">You're in!</p>
                <p className="font-body text-sm text-muted-foreground">
                  Check your inbox for your welcome gift
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-background border-border focus:border-primary"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="luxury"
                size="lg"
                disabled={isSubmitting}
                className="h-12 px-8"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>
          )}

          {/* Privacy note */}
          <p className="font-body text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
