import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Gift, Sparkles, Check, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.toLowerCase().trim() });
      
      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already subscribed!',
            description: 'This email is already part of our community.',
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({
          title: 'Welcome to NOIR925!',
          description: 'Check your inbox for your 15% discount code.',
        });
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setEmail('');
    }
  };

  const benefits = [
    { icon: Gift, text: '15% off first order' },
    { icon: Sparkles, text: 'Early access to sales' },
    { icon: Star, text: 'Exclusive offers' },
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Join NOIR925</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground mb-3">
              Get 15% Off Your First Order
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              Subscribe to receive exclusive offers, new collections & styling tips
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-6 md:mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-1.5 text-muted-foreground">
                <benefit.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs md:text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          {isSubscribed ? (
            <div className="flex items-center justify-center gap-3 py-4 px-5 bg-primary/10 rounded-2xl max-w-sm mx-auto border border-primary/20">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-display text-foreground text-sm">You're in!</p>
                <p className="text-xs text-muted-foreground">
                  Check your inbox for your welcome gift
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 md:h-12 bg-background border-border focus:border-primary rounded-xl text-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="luxury"
                size="lg"
                disabled={isSubmitting}
                className="h-11 md:h-12 px-6 rounded-xl text-sm shrink-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Joining...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>
          )}

          {/* Privacy note */}
          <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
