import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you for reaching out! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="bg-card"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      className="bg-card"
                    />
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
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Custom order inquiry"
                      required
                      className="bg-card"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Message *</label>
                  <Textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your inquiry..."
                    rows={6}
                    required
                    className="bg-card resize-none"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
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