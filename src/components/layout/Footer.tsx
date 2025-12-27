import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface SiteContact {
  phone: string | null;
  email: string | null;
  address: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  gst_number: string | null;
}

const Footer = () => {
  const [email, setEmail] = useState('');

  // Fetch dynamic contact info
  const { data: contactInfo } = useQuery({
    queryKey: ['site-contact'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_contact')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data as SiteContact;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Newsletter subscription
  const subscribeMutation = useMutation({
    mutationFn: async (subscriberEmail: string) => {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: subscriberEmail });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Welcome to NOIR925! Check your inbox for exclusive offers.');
      setEmail('');
    },
    onError: () => {
      toast.error('Subscription failed. Please try again.');
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribeMutation.mutate(email);
  };

  const footerLinks = {
    shop: [
      { name: 'Rings', href: '/shop?category=rings' },
      { name: 'Necklaces', href: '/shop?category=necklaces' },
      { name: 'Earrings', href: '/shop?category=earrings' },
      { name: 'Bracelets', href: '/shop?category=bracelets' },
      { name: 'Anklets', href: '/shop?category=anklets' },
      { name: 'Bridal', href: '/shop?category=bridal' },
    ],
    collections: [
      { name: 'Bridal Heritage', href: '/collections/bridal-heritage' },
      { name: 'Floral Bloom', href: '/collections/floral-bloom' },
      { name: 'Everyday Silver', href: '/collections/everyday-silver' },
      { name: 'Royal Noir', href: '/collections/royal-noir' },
      { name: 'New Arrivals', href: '/shop?tag=new' },
      { name: 'Bestsellers', href: '/shop?tag=bestseller' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help Center', href: '/help' },
      { name: 'Silver Care', href: '/silver-care' },
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'Track Order', href: '/track-order' },
      { name: 'FAQ', href: '/faq' },
    ],
    policies: [
      { name: 'Shipping Policy', href: '/shipping' },
      { name: 'Returns & Exchanges', href: '/returns' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
    ],
  };

  return (
    <footer className="bg-foreground text-background pb-20 md:pb-0">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-display text-2xl md:text-3xl lg:text-4xl mb-3">
              Join the <span className="text-accent">NOIR925</span> World
            </h3>
            <p className="font-body text-background/70 text-sm md:text-base mb-6">
              Be the first to discover new collections, exclusive offers, and silver care tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-background/50" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="pl-11 h-12 bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:border-accent rounded-lg"
                  required
                />
              </div>
              <Button 
                type="submit"
                variant="gold" 
                size="lg" 
                className="h-12 px-6 font-medium"
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? (
                  'Subscribing...'
                ) : (
                  <>
                    Subscribe
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-2xl md:text-3xl font-semibold tracking-wider text-background">
                NOIR<span className="text-accent">925</span>
              </span>
            </Link>
            <p className="font-body text-background/70 text-sm mb-6 max-w-xs">
              Crafting timeless silver jewellery that celebrates life's precious moments.
            </p>
            <div className="flex gap-3 mb-6">
              {contactInfo?.instagram_url && (
                <a href={contactInfo.instagram_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-background transition-colors" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {contactInfo?.facebook_url && (
                <a href={contactInfo.facebook_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-background transition-colors" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {contactInfo?.twitter_url && (
                <a href={contactInfo.twitter_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-background transition-colors" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {contactInfo?.youtube_url && (
                <a href={contactInfo.youtube_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-background transition-colors" aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
            <div className="space-y-2 text-background/70">
              {contactInfo?.phone && (
                <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-3 hover:text-background transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="font-body text-sm">{contactInfo.phone}</span>
                </a>
              )}
              {contactInfo?.email && (
                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 hover:text-background transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="font-body text-sm">{contactInfo.email}</span>
                </a>
              )}
              {contactInfo?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span className="font-body text-sm">{contactInfo.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-base md:text-lg mb-4 md:mb-6 text-background">Shop</h4>
            <ul className="space-y-2 md:space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections Links */}
          <div>
            <h4 className="font-display text-base md:text-lg mb-4 md:mb-6 text-background">Collections</h4>
            <ul className="space-y-2 md:space-y-3">
              {footerLinks.collections.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display text-base md:text-lg mb-4 md:mb-6 text-background">Support</h4>
            <ul className="space-y-2 md:space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies Links */}
          <div>
            <h4 className="font-display text-base md:text-lg mb-4 md:mb-6 text-background">Policies</h4>
            <ul className="space-y-2 md:space-y-3">
              {footerLinks.policies.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Badges & Payment */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-background/60 text-xs md:text-sm font-body">
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 md:w-8 md:h-8 bg-background/10 rounded-full flex items-center justify-center text-[10px]">✓</span>
                BIS Hallmarked
              </span>
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 md:w-8 md:h-8 bg-background/10 rounded-full flex items-center justify-center text-[10px]">🔒</span>
                Secure Payments
              </span>
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 md:w-8 md:h-8 bg-background/10 rounded-full flex items-center justify-center text-[10px]">🚚</span>
                Pan India Shipping
              </span>
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 md:w-8 md:h-8 bg-background/10 rounded-full flex items-center justify-center text-[10px]">↩</span>
                7-Day Returns
              </span>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-background/60 text-xs md:text-sm font-body">We Accept:</span>
              <div className="flex gap-1.5 md:gap-2">
                {['Visa', 'MC', 'UPI', 'GPay'].map((method) => (
                  <span
                    key={method}
                    className="px-2 md:px-3 py-1 bg-background/10 rounded text-[10px] md:text-xs font-body"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 text-center md:text-left">
            <p className="font-body text-xs md:text-sm text-background/50">
              © {new Date().getFullYear()} NOIR925. All rights reserved. Crafted with ♥ in India.
            </p>
            {contactInfo?.gst_number && (
              <p className="font-body text-[10px] md:text-xs text-background/40">
                925 Sterling Silver | GST: {contactInfo.gst_number}
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;