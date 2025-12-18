import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1920&h=800&fit=crop"
          alt="Silver craftsmanship"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/70" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 border border-background/10 rounded-full animate-pulse-soft" />
        <div className="absolute bottom-20 right-20 w-48 h-48 border border-background/10 rounded-full animate-pulse-soft delay-300" />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-accent rounded-full animate-sparkle" />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-secondary rounded-full animate-sparkle delay-200" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 text-center">
        <p className="font-accent text-sm text-accent tracking-widest uppercase mb-4 animate-fade-in">
          Begin Your Journey
        </p>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-background mb-6 max-w-4xl mx-auto animate-fade-in-up">
          Own Your
          <span className="block text-accent">Silver Story</span>
        </h2>
        <p className="font-body text-lg md:text-xl text-background/80 max-w-2xl mx-auto mb-10 animate-fade-in delay-200">
          Every piece of NOIR925 jewellery is more than an accessory — it's a chapter in your story, 
          a memory waiting to be made, a legacy to be treasured.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in delay-400">
          <Link to="/shop">
            <Button variant="gold" size="xl" className="font-display">
              Shop Now
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="hero-outline" size="xl" className="text-background border-background hover:bg-background hover:text-foreground">
              <Play className="w-5 h-5 mr-2" />
              Our Story
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-background/20">
          {['BIS Hallmarked', 'Handcrafted', 'Free Shipping', '7-Day Returns'].map((badge) => (
            <span
              key={badge}
              className="font-body text-sm text-background/60 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
