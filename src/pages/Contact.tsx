import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save to database
      const { error: dbError } = await supabase.from('contact_messages').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
      });
      if (dbError) throw dbError;

      // Send email notification
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'contact',
          data: {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
          }
        }
      });

      toast.success('Thank you for reaching out! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string) => errors[field];

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'hello@noir925.com',
      description: 'For general inquiries'
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '+91 98765 43210',
      description: 'Mon-Sat, 10AM - 7PM'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'Mumbai, Maharashtra',
      description: 'By appointment only'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: '10:00 AM - 7:00 PM',
      description: 'Monday to Saturday'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Get in Touch
              </span>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-6">
                We'd Love to
                <span className="block text-primary mt-2">Hear From You</span>
              </h1>
              <p className="font-body text-lg md:text-xl text-muted-foreground">
                Have a question about our pieces, need styling advice, or want to discuss a custom order? 
                We're here to help.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contactInfo.map((info) => (
                <div 
                  key={info.title}
                  className="p-6 bg-card border border-border/50 rounded-2xl text-center hover:shadow-luxury transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg mb-1">{info.title}</h3>
                  <p className="font-medium text-foreground mb-1">{info.value}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl mb-4">Send Us a Message</h2>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll respond within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name *</label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors(prev => ({ ...prev, name: '' })); }}
                      placeholder="John Doe"
                      className={`bg-card transition-all ${getFieldError('name') ? 'border-destructive ring-2 ring-destructive/20' : ''}`}
                    />
                    {getFieldError('name') && <p className="text-destructive text-xs mt-1">{getFieldError('name')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })); }}
                      placeholder="john@example.com"
                      className={`bg-card transition-all ${getFieldError('email') ? 'border-destructive ring-2 ring-destructive/20' : ''}`}
                    />
                    {getFieldError('email') && <p className="text-destructive text-xs mt-1">{getFieldError('email')}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="bg-card"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject *</label>
                    <Input 
                      value={formData.subject}
                      onChange={(e) => { setFormData({ ...formData, subject: e.target.value }); setErrors(prev => ({ ...prev, subject: '' })); }}
                      placeholder="Custom order inquiry"
                      className={`bg-card transition-all ${getFieldError('subject') ? 'border-destructive ring-2 ring-destructive/20' : ''}`}
                    />
                    {getFieldError('subject') && <p className="text-destructive text-xs mt-1">{getFieldError('subject')}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Message *</label>
                  <Textarea 
                    value={formData.message}
                    onChange={(e) => { setFormData({ ...formData, message: e.target.value }); setErrors(prev => ({ ...prev, message: '' })); }}
                    placeholder="Tell us about your inquiry..."
                    rows={6}
                    className={`bg-card resize-none transition-all ${getFieldError('message') ? 'border-destructive ring-2 ring-destructive/20' : ''}`}
                  />
                  {getFieldError('message') && <p className="text-destructive text-xs mt-1">{getFieldError('message')}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Can't find what you're looking for? Check our comprehensive FAQ section 
              or reach out directly.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/silver-care" className="px-6 py-3 bg-card border border-border rounded-full hover:border-primary transition-colors">
                Silver Care Guide
              </a>
              <a href="/shop" className="px-6 py-3 bg-card border border-border rounded-full hover:border-primary transition-colors">
                Browse Collection
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;