import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart } from 'lucide-react';

const WeddingCollectionShowcase = () => {
  const weddingItems = [
    {
      name: 'Bridal Tiara Set',
      price: '₹24,999',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=500&fit=crop',
    },
    {
      name: 'Mangalsutra',
      price: '₹18,999',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=500&fit=crop',
    },
    {
      name: 'Bridal Bangles',
      price: '₹12,999',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop',
    },
    {
      name: 'Maang Tikka',
      price: '₹8,999',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=500&fit=crop',
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-secondary/5 via-background to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <Heart className="w-4 h-4 text-secondary" />
            <span className="font-accent text-sm tracking-wider text-secondary">Wedding Season 2024</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            Bridal <span className="text-secondary">Collection</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto text-lg">
            Begin your forever with our exquisite bridal jewellery, handcrafted to make your special day unforgettable.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Large Feature Image */}
          <div className="relative group">
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5]">
              <img 
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=1000&fit=crop"
                alt="Bridal Collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              
              {/* Floating Elements */}
              <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                <span className="font-accent text-sm">Limited Edition</span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="font-display text-3xl md:text-4xl text-background mb-2">Royal Heritage</h3>
                <p className="font-body text-background/80 mb-4">Complete bridal ensemble</p>
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-accent">₹89,999</span>
                  <span className="text-background/60 line-through">₹1,19,999</span>
                  <span className="px-2 py-1 bg-secondary rounded text-xs font-medium text-secondary-foreground">25% OFF</span>
                </div>
              </div>
            </div>
            
            {/* Decorative Border */}
            <div className="absolute -inset-2 border border-secondary/20 rounded-3xl -z-10" />
            <div className="absolute -inset-4 border border-secondary/10 rounded-[2rem] -z-20" />
          </div>

          {/* Right - Product Grid */}
          <div className="grid grid-cols-2 gap-4">
            {weddingItems.map((item, index) => (
              <Link 
                key={index}
                to="/shop?category=bridal"
                className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-muted/30"
              >
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h4 className="font-display text-lg text-background">{item.name}</h4>
                  <p className="font-body text-accent">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/collections/bridal-heritage">
            <Button variant="luxury" size="xl" className="group">
              <Heart className="w-5 h-5 mr-2" />
              Explore Bridal Collection
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WeddingCollectionShowcase;
