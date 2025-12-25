import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { products } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';
import { ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollectionCounts } from '@/hooks/useProductCounts';
import FloatingSpinWheel from '@/components/shop/FloatingSpinWheel';

const collectionData = [
  {
    slug: 'bridal-heritage',
    name: 'Bridal Heritage',
    description: 'Timeless pieces for your most cherished moments. Crafted with love for the bride who appreciates tradition and elegance.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=600&fit=crop',
    color: 'from-rose-500/20 to-pink-500/10',
    getProducts: () => products.filter(p => p.category === 'Rings' || p.category === 'Necklaces' || p.category === 'Sets').slice(0, 12),
  },
  {
    slug: 'minimalist',
    name: 'Minimalist Edit',
    description: 'Clean lines, subtle beauty. Our minimalist collection celebrates the art of understated elegance.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop',
    color: 'from-slate-500/20 to-gray-500/10',
    getProducts: () => products.filter(p => p.price < 3500).slice(0, 12),
  },
  {
    slug: 'statement',
    name: 'Statement Pieces',
    description: 'Bold, beautiful, unforgettable. Make every entrance memorable with our statement collection.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop',
    color: 'from-amber-500/20 to-orange-500/10',
    getProducts: () => products.filter(p => p.price > 5000 || p.isTrending).slice(0, 12),
  },
  {
    slug: 'festive',
    name: 'Festive Luxe',
    description: 'Celebrate in style. Our festive collection brings sparkle and joy to your special occasions.',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&h=600&fit=crop',
    color: 'from-purple-500/20 to-violet-500/10',
    getProducts: () => products.filter(p => p.isBestseller || p.discount).slice(0, 12),
  },
  {
    slug: 'everyday',
    name: 'Everyday Elegance',
    description: 'Effortless style for daily wear. Pieces that transition seamlessly from day to night.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
    color: 'from-teal-500/20 to-cyan-500/10',
    getProducts: () => products.filter(p => p.price < 4000).slice(0, 12),
  },
  {
    slug: 'monsoon',
    name: 'Monsoon Magic',
    description: 'Rain-proof elegance. Specially curated pieces that shine even on cloudy days.',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&h=600&fit=crop',
    color: 'from-blue-500/20 to-indigo-500/10',
    getProducts: () => products.slice(0, 12),
  }
];

const Collections = () => {
  const { slug } = useParams();
  const { data: collectionCounts = [] } = useCollectionCounts();
  
  const collection = slug ? collectionData.find(c => c.slug === slug) : null;

  // Merge counts with collection data
  const collectionsWithCounts = collectionData.map(col => {
    const countData = collectionCounts.find(c => c.slug === col.slug);
    return {
      ...col,
      productCount: countData?.count || col.getProducts().length,
    };
  });

  if (collection) {
    const collectionProducts = collection.getProducts();
    
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
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/20" />
            
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
              <Link to="/collections">
                <Button variant="secondary" size="sm" className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background">
                  <ChevronLeft className="w-4 h-4" />
                  All Collections
                </Button>
              </Link>
            </div>
            
            <div className="absolute inset-0 flex items-end">
              <div className="container mx-auto px-4 pb-10 md:pb-14">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-accent text-sm font-medium tracking-wide">
                    {collectionProducts.length} Products
                  </span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl text-background mb-3">
                  {collection.name}
                </h1>
                <p className="text-background/80 text-lg max-w-xl leading-relaxed">
                  {collection.description}
                </p>
              </div>
            </div>
          </section>

          {/* Products Grid */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {collectionProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {collectionProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">No products in this collection yet.</p>
                  <Link to="/shop">
                    <Button>Browse All Products</Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        </main>

        <FloatingSpinWheel />
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
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
          
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Curated Collections</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl mb-6">
                Discover Our
                <span className="block text-primary mt-2">Signature Collections</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
                Each collection tells a unique story, crafted to match every mood and milestone in your journey.
              </p>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collectionsWithCounts.map((col, index) => (
                <Link 
                  key={col.slug}
                  to={`/collections/${col.slug}`}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img 
                    src={col.image}
                    alt={col.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent`} />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-accent text-sm font-medium">{col.productCount} Products</span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl text-background mb-2">
                      {col.name}
                    </h3>
                    <p className="text-background/70 text-sm mb-4 line-clamp-2">
                      {col.description}
                    </p>
                    <div className="flex items-center gap-2 text-accent group-hover:gap-4 transition-all duration-300">
                      <span className="text-sm font-medium">Explore Collection</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-3xl mb-4">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground mb-6">Browse our complete catalog of handcrafted silver pieces.</p>
            <Link to="/shop">
              <Button size="lg" className="gap-2">
                View All Products
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <FloatingSpinWheel />
      <Footer />
    </div>
  );
};

export default Collections;
