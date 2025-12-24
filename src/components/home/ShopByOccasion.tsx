import { Link } from 'react-router-dom';
import { occasions } from '@/data/products';
import { ArrowRight } from 'lucide-react';

const ShopByOccasion = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <p className="font-accent text-xs md:text-sm text-primary tracking-widest uppercase mb-2">
            Find the Perfect Piece
          </p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground mb-3">
            Shop by Occasion
          </h2>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Whether it's a celebration of love, a milestone moment, or a token of appreciation, 
            we have the perfect silver companion.
          </p>
        </div>

        {/* Occasions Grid - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {occasions.map((occasion, index) => (
            <Link
              key={occasion.id}
              to={`/shop?occasion=${occasion.id}`}
              className="group relative overflow-hidden rounded-xl aspect-[3/4]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={occasion.image}
                  alt={occasion.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
              </div>

              {/* Decorative frame */}
              <div className="absolute inset-2 md:inset-3 border border-background/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex items-end justify-center p-3 md:p-4">
                <div className="text-center transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                  <h3 className="font-display text-sm md:text-lg text-background mb-1">
                    {occasion.name}
                  </h3>
                  <p className="font-body text-[10px] md:text-xs text-background/60 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1">
                    Shop Now <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByOccasion;