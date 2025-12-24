import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gift, Star, Sparkles } from 'lucide-react';

const SeasonalBanner = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Festive Collection */}
          <div className="relative group overflow-hidden rounded-2xl aspect-[16/9] md:aspect-[4/3]">
            <img 
              src="https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=600&fit=crop"
              alt="Festive Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <Star 
                  key={i} 
                  className="w-4 h-4 text-accent fill-accent animate-pulse" 
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
            
            <div className="absolute inset-0 flex flex-col justify-center p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 backdrop-blur-sm w-fit mb-4">
                <Gift className="w-4 h-4 text-accent" />
                <span className="font-accent text-xs text-accent tracking-wider">Festival Special</span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-background mb-2">Diwali Collection</h3>
              <p className="font-body text-background/70 mb-4 max-w-sm">
                Light up your celebrations with our stunning festive jewellery
              </p>
              <Link to="/collections/festive">
                <Button variant="hero" size="lg">
                  Explore Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Gift Guide */}
          <div className="relative group overflow-hidden rounded-2xl aspect-[16/9] md:aspect-[4/3]">
            <img 
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=600&fit=crop"
              alt="Gift Guide"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-foreground/80 via-foreground/50 to-transparent" />
            
            {/* Sparkle Effect */}
            <div className="absolute top-4 left-4">
              <Sparkles className="w-6 h-6 text-secondary animate-pulse" />
            </div>
            
            <div className="absolute inset-0 flex flex-col justify-center items-end p-8 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20 backdrop-blur-sm mb-4">
                <span className="font-accent text-xs text-secondary tracking-wider">Perfect Gifts</span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-background mb-2">Gift Guide 2024</h3>
              <p className="font-body text-background/70 mb-4 max-w-sm">
                Find the perfect silver piece for your loved ones
              </p>
              <Link to="/collections/gifts">
                <Button variant="hero" size="lg">
                  Shop Gifts
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Promo Strip */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/shop?tag=new"
            className="group flex items-center justify-between p-5 bg-muted/50 rounded-xl hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold">New Arrivals</h4>
                <p className="text-xs text-muted-foreground">Fresh designs weekly</p>
              </div>
            </div>
            <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
          </Link>

          <Link 
            to="/shop?tag=bestseller"
            className="group flex items-center justify-between p-5 bg-muted/50 rounded-xl hover:bg-secondary/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary transition-colors">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold">Bestsellers</h4>
                <p className="text-xs text-muted-foreground">Customer favorites</p>
              </div>
            </div>
            <span className="text-muted-foreground group-hover:text-secondary transition-colors">→</span>
          </Link>

          <Link 
            to="/shop?sale=true"
            className="group flex items-center justify-between p-5 bg-muted/50 rounded-xl hover:bg-accent/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold">Special Offers</h4>
                <p className="text-xs text-muted-foreground">Up to 50% off</p>
              </div>
            </div>
            <span className="text-muted-foreground group-hover:text-accent transition-colors">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SeasonalBanner;
