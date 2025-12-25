import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Award, Heart, Gem, Users, Sparkles, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/seo/SEOHead";

const About = () => {
  const values = [
    {
      icon: Gem,
      title: "Craftsmanship",
      description: "Each piece is meticulously handcrafted by skilled artisans with decades of experience in traditional silversmithing.",
    },
    {
      icon: Heart,
      title: "Passion",
      description: "We pour our heart into every design, creating jewelry that tells your unique story and celebrates life's precious moments.",
    },
    {
      icon: Shield,
      title: "Quality",
      description: "Only the finest 925 sterling silver and ethically sourced materials make it into our collections.",
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "Blending traditional techniques with contemporary design to create timeless pieces with a modern edge.",
    },
  ];

  const milestones = [
    { year: "2010", event: "Founded in Jaipur, India's jewelry capital, with a vision to redefine silver jewelry" },
    { year: "2014", event: "Launched our flagship store and established our online presence" },
    { year: "2017", event: "Expanded to 10+ cities across India with exclusive retail partners" },
    { year: "2020", event: "Celebrated 100,000+ happy customers and launched international shipping" },
    { year: "2023", event: "Introduced sustainable packaging and eco-friendly production practices" },
    { year: "2024", event: "Launched our heritage bridal collection and artisan collaboration program" },
  ];

  const stats = [
    { value: "50+", label: "Master Artisans", description: "Skilled craftspeople" },
    { value: "100K+", label: "Happy Customers", description: "Worldwide" },
    { value: "500+", label: "Unique Designs", description: "In our collection" },
    { value: "14+", label: "Years", description: "Of excellence" },
  ];

  // Organization Schema for About page
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NOIR925",
    "url": "https://noir925.com",
    "logo": "https://noir925.com/logo.png",
    "description": "Premium 925 sterling silver jewelry brand from Jaipur, India. Handcrafted luxury jewelry with BIS hallmark certification.",
    "foundingDate": "2010",
    "foundingLocation": {
      "@type": "Place",
      "name": "Jaipur, Rajasthan, India"
    },
    "sameAs": [
      "https://instagram.com/noir925",
      "https://facebook.com/noir925",
      "https://pinterest.com/noir925"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-98765-43210",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About NOIR925 | Our Story, Craftsmanship & Heritage"
        description="Discover NOIR925's journey from Jaipur's jewelry capital. 14+ years of handcrafted 925 sterling silver jewelry, 50+ master artisans, and 100K+ happy customers worldwide."
        canonicalUrl="https://noir925.com/about"
        keywords="NOIR925 about, silver jewelry brand India, Jaipur jewelry, handcrafted silver, 925 sterling silver, Indian jewelry brand"
        structuredData={organizationSchema}
        ogImage="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/50 to-background" />
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-primary/10 blur-[80px]" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-background/90 tracking-wide">Est. 2010</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display text-background mb-6 leading-tight">
            The Art of
            <span className="block text-accent">Silver Craftsmanship</span>
          </h1>
          <p className="text-xl text-background/80 max-w-2xl mx-auto leading-relaxed">
            Where tradition meets innovation, and every piece tells a story of passion, precision, and timeless beauty.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl font-display mb-8 leading-tight">
                Born from a Love of
                <span className="text-primary block">Silver & Soul</span>
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  NOIR925 was born from a simple belief: that fine jewelry should be accessible 
                  to everyone. Our journey began in the historic city of Jaipur, India's jewelry 
                  capital, where generations of skilled artisans have perfected the art of 
                  silversmithing.
                </p>
                <p>
                  Today, we bring together traditional craftsmanship and modern design to create 
                  pieces that are both timeless and contemporary. Each piece in our collection 
                  tells a story – of heritage, of artistry, and of the hands that shaped it.
                </p>
                <p>
                  We believe that jewelry is more than adornment. It's a form of self-expression, 
                  a celebration of life's moments, and a connection to the ones we love.
                </p>
              </div>
              <div className="mt-8">
                <Link to="/collections">
                  <Button size="lg" className="gap-2">
                    Explore Collections
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80"
                  alt="Artisan crafting jewelry"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-8 -left-8 bg-primary text-primary-foreground p-8 rounded-2xl shadow-xl">
                <p className="text-5xl font-display">14+</p>
                <p className="text-sm opacity-80 mt-1">Years of Excellence</p>
              </div>
              {/* Decorative Ring */}
              <div className="absolute -top-6 -right-6 w-24 h-24 border-4 border-accent/30 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6"
              >
                <p className="text-4xl md:text-5xl font-display text-primary mb-2">{stat.value}</p>
                <p className="font-display text-lg mb-1">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Values
            </span>
            <h2 className="text-4xl md:text-5xl font-display mb-4">What Drives Us</h2>
            <p className="text-muted-foreground text-lg">
              The principles that guide every piece we create and every relationship we build.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="group text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-display mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-display mb-4">Milestones</h2>
            <p className="text-muted-foreground text-lg">
              From humble beginnings to becoming a trusted name in silver jewelry.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-0.5" />
              
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className={`relative flex items-start gap-8 mb-12 last:mb-0 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Year Badge */}
                  <div className={`shrink-0 relative z-10 ${index % 2 === 0 ? 'md:text-right md:w-1/2 md:pr-12' : 'md:w-1/2 md:pl-12'}`}>
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-display text-lg shadow-lg">
                      {milestone.year}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'}`}>
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                      <p className="text-foreground">{milestone.event}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Team
            </span>
            <h2 className="text-4xl md:text-5xl font-display mb-6">The People Behind the Craft</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Behind every piece of NOIR925 jewelry is a team of passionate individuals – 
              from our master artisans in Jaipur to our designers, customer service specialists, 
              and everyone in between. Together, we're committed to bringing you the finest 
              silver jewelry experience.
            </p>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Recognition
          </span>
          <h2 className="text-4xl md:text-5xl font-display mb-6">Award-Winning Excellence</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Recognized for our commitment to quality and design, NOIR925 has been honored 
            with multiple industry awards for craftsmanship, innovation, and customer service.
          </p>
          <Link to="/shop">
            <Button size="lg" className="gap-2">
              Shop Our Collection
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
