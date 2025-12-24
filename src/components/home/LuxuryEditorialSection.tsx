import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Quote } from 'lucide-react';

const LuxuryEditorialSection = () => {
  return (
    <section className="py-20 md:py-32 bg-foreground text-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Editorial Header */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <span className="font-accent text-sm tracking-[0.3em] text-accent uppercase mb-4 block">The Art of Silver</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Where Tradition
              <br />
              <span className="text-accent italic">Meets Modernity</span>
            </h2>
          </div>
          <div className="relative">
            <Quote className="w-12 h-12 text-accent/30 absolute -top-6 -left-4" />
            <p className="font-body text-xl text-background/70 leading-relaxed pl-8">
              Each piece in our collection tells a story of centuries-old craftsmanship reimagined for the contemporary soul. 
              We don't just create jewellery; we craft heirlooms.
            </p>
          </div>
        </div>

        {/* Editorial Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Large Feature */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-2xl">
            <img 
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&h=1200&fit=crop"
              alt="Master Craftsman"
              className="w-full h-full object-cover aspect-[4/5] md:aspect-auto group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="font-accent text-xs tracking-[0.2em] text-accent uppercase">Featured Story</span>
              <h3 className="font-display text-3xl md:text-4xl text-background mt-2 mb-4">
                The Silversmith's Legacy
              </h3>
              <p className="font-body text-background/70 mb-6 max-w-md">
                Three generations of master craftsmen continue the tradition of handcrafting 
                pure 925 silver into wearable art.
              </p>
              <Link to="/about">
                <Button variant="hero-outline" className="group/btn">
                  Read the Story
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Small Features */}
          <div className="relative group overflow-hidden rounded-2xl aspect-square">
            <img 
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop"
              alt="Sustainable Silver"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="font-accent text-xs tracking-[0.2em] text-accent uppercase">Sustainability</span>
              <h4 className="font-display text-xl text-background mt-2">Ethical Sourcing</h4>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl aspect-square">
            <img 
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop"
              alt="Hallmark Certified"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="font-accent text-xs tracking-[0.2em] text-accent uppercase">Certification</span>
              <h4 className="font-display text-xl text-background mt-2">BIS Hallmarked</h4>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-background/10">
          {[
            { number: '25+', label: 'Years of Excellence' },
            { number: '50K+', label: 'Happy Customers' },
            { number: '100%', label: 'Certified Silver' },
            { number: '30', label: 'Days Return Policy' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <span className="font-display text-4xl md:text-5xl text-accent">{stat.number}</span>
              <p className="font-body text-sm text-background/60 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LuxuryEditorialSection;
