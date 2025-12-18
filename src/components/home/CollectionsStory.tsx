import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collections } from '@/data/products';

const CollectionsStory = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-accent text-sm text-primary tracking-widest uppercase mb-2">
            Explore
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6">
            Our Collections
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Each collection tells a unique story, crafted with passion and precision 
            to complement every chapter of your life.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.id}`}
              className={`group relative overflow-hidden rounded-2xl ${
                index === 0 ? 'md:row-span-2 aspect-[3/4]' : 'aspect-[16/9]'
              }`}
              data-cursor="card"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                  <p className="font-accent text-sm text-background/70 tracking-widest uppercase mb-2">
                    {collection.productCount} Pieces
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl text-background mb-2">
                    {collection.name}
                  </h3>
                  <p className="font-body text-background/80 mb-4 max-w-sm">
                    {collection.description}
                  </p>
                  <div className="flex items-center gap-2 text-accent font-body text-sm uppercase tracking-wider group-hover:gap-4 transition-all duration-300">
                    Explore Collection
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/collections">
            <Button variant="luxury" size="lg">
              View All Collections
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CollectionsStory;
