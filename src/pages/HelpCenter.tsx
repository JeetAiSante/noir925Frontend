import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Package, CreditCard, Truck, RotateCcw, Phone, Mail, MessageCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const helpCategories = [
  {
    id: 'orders',
    icon: Package,
    title: 'Orders & Delivery',
    description: 'Track orders, delivery times, shipping info',
    color: 'bg-blue-500/10 text-blue-600',
    faqs: [
      { q: 'How can I track my order?', a: 'You can track your order by visiting the Track Order page and entering your order number. You will also receive tracking updates via email and SMS.' },
      { q: 'What are the delivery times?', a: 'Standard delivery takes 5-7 business days. Express delivery (available in select cities) takes 2-3 business days. Metro cities usually receive orders faster.' },
      { q: 'Do you deliver pan-India?', a: 'Yes! We deliver to all serviceable pin codes across India. Enter your pin code at checkout to confirm delivery availability.' },
    ],
  },
  {
    id: 'payments',
    icon: CreditCard,
    title: 'Payments & Pricing',
    description: 'Payment methods, COD, EMI options',
    color: 'bg-green-500/10 text-green-600',
    faqs: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, Paytm, PhonePe, Google Pay, and Cash on Delivery (COD) for orders below ₹10,000.' },
      { q: 'Is Cash on Delivery available?', a: 'Yes, COD is available for orders up to ₹10,000. A small COD fee of ₹50 applies. Not available for all pin codes.' },
      { q: 'Do you offer EMI options?', a: 'Yes! We offer No-Cost EMI on orders above ₹3,000 through select bank credit cards. EMI options are shown at checkout.' },
    ],
  },
  {
    id: 'shipping',
    icon: Truck,
    title: 'Shipping & Packaging',
    description: 'Free shipping, gift packaging',
    color: 'bg-purple-500/10 text-purple-600',
    faqs: [
      { q: 'Is shipping free?', a: 'Yes! We offer free shipping on all orders above ₹2,000. Orders below ₹2,000 have a flat shipping fee of ₹99.' },
      { q: 'How is the jewellery packaged?', a: 'Each piece comes in our signature luxury box with a soft velvet pouch, authenticity card, and care instructions. Gift wrapping is available at checkout.' },
      { q: 'Can I get express delivery?', a: 'Express delivery (2-3 days) is available in major metro cities for an additional fee of ₹199. Select this option at checkout.' },
    ],
  },
  {
    id: 'returns',
    icon: RotateCcw,
    title: 'Returns & Exchanges',
    description: '7-day returns, exchange policy',
    color: 'bg-orange-500/10 text-orange-600',
    faqs: [
      { q: 'What is your return policy?', a: 'We offer a 7-day easy return policy. Items must be unused, in original packaging with all tags intact. Refunds are processed within 5-7 business days.' },
      { q: 'How do I initiate a return?', a: 'Go to your Account > Orders > Select the order > Click "Return Item". Our team will arrange pickup within 48 hours.' },
      { q: 'Can I exchange for a different size?', a: 'Yes! Exchanges for different sizes are free. Simply initiate an exchange request and we will send the new size once we receive the original item.' },
    ],
  },
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch contact info from database
  const { data: contactInfo } = useQuery({
    queryKey: ['site-contact-help'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_contact')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const filteredCategories = helpCategories.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.faqs.some(faq => 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Help Center | NOIR925"
        description="Get help with your NOIR925 orders, payments, shipping, and returns. Find answers to common questions or contact our support team."
        keywords="NOIR925 help, customer support, order help, shipping questions, return policy"
      />
      <Header />

      <main className="pt-8 pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16 mb-8">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              How can we help you?
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Find answers to common questions or get in touch with our support team
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base rounded-full border-2 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Link to="/track-order" className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium text-sm">Track Order</p>
            </Link>
            <Link to="/returns" className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-6 h-6 text-orange-600" />
              </div>
              <p className="font-medium text-sm">Returns</p>
            </Link>
            <Link to="/size-guide" className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📏</span>
              </div>
              <p className="font-medium text-sm">Size Guide</p>
            </Link>
            <Link to="/contact" className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-medium text-sm">Contact Us</p>
            </Link>
          </div>

          {/* Help Categories */}
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center`}>
                      <category.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl">{category.title}</h2>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </div>
                <Accordion type="single" collapsible className="px-6">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`${category.id}-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 text-center">
            <h3 className="font-display text-2xl mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-6">Our support team is here to assist you</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href={`tel:${contactInfo?.phone || '+919876543210'}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-background rounded-full hover:shadow-lg transition-shadow"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-medium">Call Us</span>
              </a>
              <a 
                href={`mailto:${contactInfo?.email || 'support@noir925.com'}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-background rounded-full hover:shadow-lg transition-shadow"
              >
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-medium">Email Us</span>
              </a>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Contact Form</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
