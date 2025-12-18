import { Link } from 'react-router-dom';
import { occasions } from '@/data/products';

const ShopByOccasion = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-sm text-primary tracking-widest uppercase mb-2">
            Find the Perfect Piece
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6">
            Shop by Occasion
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether it's a celebration of love, a milestone moment, or a token of appreciation, 
            we have the perfect silver companion.
          </p>
        </div>

        {/* Occasions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {occasions.map((occasion, index) => (
            <Link
              key={occasion.id}
              to={`/shop?occasion=${occasion.id}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4]"
              style={{ animationDelay: `${index * 100}ms` }}
              data-cursor="card"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={occasion.image}
                  alt={occasion.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              </div>

              {/* Decorative frame */}
              <div className="absolute inset-3 border border-background/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex items-end justify-center p-6">
                <div className="text-center transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                  <h3 className="font-display text-xl text-background mb-1">
                    {occasion.name}
                  </h3>
                  <p className="font-body text-xs text-background/60 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop Now
                  </p>
                </div>
              </div>

              {/* Bloom effect */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="w-24 h-24 rounded-full bg-secondary/20 animate-bloom" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByOccasion;
