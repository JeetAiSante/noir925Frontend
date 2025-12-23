import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Droplets, Sparkles, Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const SilverCare = () => {
  const careTips = [
    {
      icon: Droplets,
      title: 'Keep It Dry',
      description: 'Remove silver jewellery before swimming, showering, or exercising. Water and sweat can cause tarnishing.'
    },
    {
      icon: Sparkles,
      title: 'Polish Regularly',
      description: 'Use a soft, lint-free cloth to gently polish your silver pieces. This removes oils and prevents tarnish buildup.'
    },
    {
      icon: Shield,
      title: 'Store Properly',
      description: 'Keep pieces in anti-tarnish pouches or airtight containers. Store items separately to prevent scratching.'
    },
    {
      icon: Clock,
      title: 'Last On, First Off',
      description: 'Put on jewellery after applying cosmetics, perfumes, and lotions. Remove it first when undressing.'
    }
  ];

  const dosDonts = {
    dos: [
      'Wear your silver often - skin oils help prevent tarnish',
      'Clean with warm water and mild soap',
      'Pat dry immediately after cleaning',
      'Use silver polishing cloth regularly',
      'Store in a cool, dry place'
    ],
    donts: [
      'Expose to chlorine or saltwater',
      'Use harsh chemicals or abrasives',
      'Store in humid environments',
      'Wear during household chores',
      'Let perfume contact silver directly'
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                925 Silver Care Guide
              </span>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-6">
                Preserve Your Silver's
                <span className="block text-primary mt-2">Eternal Beauty</span>
              </h1>
              <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed">
                Learn how to care for your precious 925 sterling silver pieces to maintain their 
                lustrous shine and extend their lifetime for generations.
              </p>
            </div>
          </div>
        </section>

        {/* Care Tips Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl mb-4">Essential Care Tips</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Follow these simple guidelines to keep your NOIR925 jewellery looking immaculate.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {careTips.map((tip, index) => (
                <div 
                  key={tip.title}
                  className="group p-8 bg-card border border-border/50 rounded-2xl hover:shadow-luxury transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <tip.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-xl mb-3">{tip.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Do's and Don'ts */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl mb-4">Do's & Don'ts</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Simple habits that make a significant difference in preserving your silver's beauty.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Do's */}
              <div className="bg-card border border-primary/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl text-primary">Do's</h3>
                </div>
                <ul className="space-y-4">
                  {dosDonts.dos.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="bg-card border border-destructive/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <h3 className="font-display text-2xl text-destructive">Don'ts</h3>
                </div>
                <ul className="space-y-4">
                  {dosDonts.donts.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Understanding Tarnish */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl mb-6">
                  Understanding Silver Tarnish
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Tarnish is a natural chemical reaction between silver and sulfur-containing 
                    substances in the air. While it doesn't damage your jewellery, it can dull 
                    the beautiful shine we all love.
                  </p>
                  <p>
                    925 sterling silver is 92.5% pure silver mixed with 7.5% other metals 
                    (usually copper) to increase durability. This alloy can tarnish over time, 
                    but with proper care, your pieces will maintain their brilliance.
                  </p>
                  <p>
                    The good news? Tarnish is completely reversible! Regular cleaning and 
                    proper storage will keep your NOIR925 pieces looking as stunning as the 
                    day you received them.
                  </p>
                </div>
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop"
                  alt="Silver jewelry care"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Professional Cleaning CTA */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-6">
              Need Professional Care?
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              For heavily tarnished pieces or intricate designs that require special attention, 
              our expert jewellers offer professional cleaning and restoration services.
            </p>
            <a 
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-background text-foreground rounded-full font-medium hover:bg-background/90 transition-colors"
            >
              Contact Our Care Team
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SilverCare;