import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { products } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';
import { ArrowRight } from 'lucide-react';

const collections = [
  {
    slug: 'bridal-heritage',
    name: 'Bridal Heritage',
    description: 'Timeless pieces for your most cherished moments. Crafted with love for the bride who appreciates tradition and elegance.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=600&fit=crop',
    products: products.filter(p => p.category === 'Rings' || p.category === 'Necklaces').slice(0, 8)
  },
  {
    slug: 'minimalist',
    name: 'Minimalist Edit',
    description: 'Clean lines, subtle beauty. Our minimalist collection celebrates the art of understated elegance.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop',
    products: products.filter(p => p.price < 2500).slice(0, 8)
  },
  {
    slug: 'statement',
    name: 'Statement Pieces',
    description: 'Bold, beautiful, unforgettable. Make every entrance memorable with our statement collection.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop',
    products: products.filter(p => p.originalPrice).slice(0, 8)
  },
  {
    slug: 'festive',
    name: 'Festive Luxe',
    description: 'Celebrate in style. Our festive collection brings sparkle and joy to your special occasions.',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&h=600&fit=crop',
    products: products.slice(0, 8)
  },
  {
    slug: 'everyday',
    name: 'Everyday Elegance',
    description: 'Effortless style for daily wear. Pieces that transition seamlessly from day to night.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
    products: products.filter(p => p.price < 3000).slice(0, 8)
  },
  {
    slug: 'monsoon',
    name: 'Monsoon Magic',
    description: 'Rain-proof elegance. Specially curated pieces that shine even on cloudy days.',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&h=600&fit=crop',
    products: products.slice(2, 10)
  }
];

const Collections = () => {
  const { slug } = useParams();
  const collection = slug ? collections.find(c => c.slug === slug) : null;

  if (collection) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          {/* Collection Hero */}
          <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
            <img 
              src={collection.image}
              alt={collection.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="container mx-auto px-4 pb-12">
                <h1 className="font-display text-4xl md:text-6xl text-background mb-4">
                  {collection.name}
                </h1>
                <p className="text-background/80 text-lg max-w-2xl">
                  {collection.description}
                </p>
              </div>
            </div>
          </section>

          {/* Products Grid */}
          <section className="py-12 md:py-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {collection.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  // Collections Overview
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Curated Collections
              </span>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-6">
                Discover Our
                <span className="block text-primary mt-2">Signature Collections</span>
              </h1>
              <p className="font-body text-lg md:text-xl text-muted-foreground">
                Each collection tells a unique story, crafted to match every mood, moment, and milestone in your life.
              </p>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col, index) => (
                <Link 
                  key={col.slug}
                  to={`/collections/${col.slug}`}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img 
                    src={col.image}
                    alt={col.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="font-display text-2xl md:text-3xl text-background mb-2">
                      {col.name}
                    </h3>
                    <p className="text-background/70 text-sm mb-4 line-clamp-2">
                      {col.description}
                    </p>
                    <div className="flex items-center gap-2 text-accent group-hover:gap-4 transition-all">
                      <span className="text-sm font-medium">Explore Collection</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Collections;