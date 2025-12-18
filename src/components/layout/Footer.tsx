import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
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
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-display text-3xl md:text-4xl mb-4">Join the NOIR925 World</h3>
            <p className="font-body text-background/70 mb-8">
              Be the first to discover new collections, exclusive offers, and silver care tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-6 py-4 rounded-lg bg-background/10 border border-background/20 text-background placeholder:text-background/50 focus:outline-none focus:border-background/40 transition-colors font-body"
              />
              <Button variant="gold" size="lg" className="font-display">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-3xl font-semibold tracking-wider text-background">
                NOIR<span className="text-accent">925</span>
              </span>
            </Link>
            <p className="font-body text-background/70 mb-6 max-w-xs">
              Crafting timeless silver jewellery that celebrates life's precious moments. 
              Each piece tells a story of heritage, elegance, and modern sophistication.
            </p>
            <div className="flex gap-4 mb-8">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <div className="space-y-3 text-background/70">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span className="font-body text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span className="font-body text-sm">hello@noir925.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span className="font-body text-sm">Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-lg mb-6 text-background">Shop</h4>
            <ul className="space-y-3">
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
            <h4 className="font-display text-lg mb-6 text-background">Collections</h4>
            <ul className="space-y-3">
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
            <h4 className="font-display text-lg mb-6 text-background">Support</h4>
            <ul className="space-y-3">
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
            <h4 className="font-display text-lg mb-6 text-background">Policies</h4>
            <ul className="space-y-3">
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-background/60 text-sm font-body">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center text-xs">✓</span>
                BIS Hallmarked
              </span>
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center text-xs">🔒</span>
                Secure Payments
              </span>
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center text-xs">🚚</span>
                Pan India Shipping
              </span>
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center text-xs">↩</span>
                7-Day Returns
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-background/60 text-sm font-body">We Accept:</span>
              <div className="flex gap-2">
                {['Visa', 'MC', 'UPI', 'GPay'].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1 bg-background/10 rounded text-xs font-body"
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="font-body text-sm text-background/50">
              © 2024 NOIR925. All rights reserved. Crafted with ♥ in India.
            </p>
            <p className="font-body text-xs text-background/40">
              925 Sterling Silver | GST: 27AABCN1234A1Z5
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
