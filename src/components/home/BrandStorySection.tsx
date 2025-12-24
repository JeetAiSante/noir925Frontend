import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Award, Users, Gem } from 'lucide-react';

const BrandStorySection = () => {
  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Image with Video Play */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img 
                src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&h=1000&fit=crop"
                alt="NOIR925 Craftsmanship"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
              
              {/* Play Button */}
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center group hover:scale-110 transition-transform shadow-luxury">
                <Play className="w-8 h-8 text-primary ml-1 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-12 bg-background rounded-xl p-6 shadow-luxury border border-border/50 max-w-[200px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gem className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">92.5%</p>
                  <p className="text-xs text-muted-foreground">Pure Silver</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Every piece certified for purity
              </p>
            </div>

            {/* Decorative Frame */}
            <div className="absolute -inset-4 border border-primary/20 rounded-3xl -z-10" />
          </div>

          {/* Right - Content */}
          <div>
            <span className="font-accent text-sm tracking-[0.3em] text-primary uppercase mb-4 block">Our Story</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Crafting Legacy
              <br />
              <span className="text-primary">Since 1998</span>
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
              From a small workshop in Jaipur to becoming India's trusted silver jewellery house, 
              our journey is defined by an unwavering commitment to quality, craftsmanship, and 
              customer delight.
            </p>

            {/* Values */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { icon: Award, title: 'Award Winning', desc: '15+ industry awards' },
                { icon: Users, title: 'Expert Artisans', desc: '100+ skilled craftsmen' },
                { icon: Gem, title: 'Premium Quality', desc: 'BIS certified silver' },
                { icon: Play, title: 'Handcrafted', desc: 'Traditional techniques' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-semibold">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/about">
                <Button variant="luxury" size="lg">
                  Read Our Story
                </Button>
              </Link>
              <Link to="/collections">
                <Button variant="luxury-outline" size="lg">
                  View Collections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStorySection;
