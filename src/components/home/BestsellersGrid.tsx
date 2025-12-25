import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { products as staticProducts } from '@/data/products';

const BestsellersGrid = () => {
  const [filter, setFilter] = useState('all');
  const { data: dbProducts, isLoading } = useProducts({ limit: 12 });

  const filters = [
    { id: 'all', name: 'All' },
    { id: 'bestseller', name: 'Bestsellers' },
    { id: 'new', name: 'New Arrivals' },
    { id: 'trending', name: 'Trending' },
  ];

  // Use database products if available, fallback to static
  const allProducts = dbProducts && dbProducts.length > 0 ? dbProducts : staticProducts;

  const filteredProducts = allProducts.filter((product) => {
    if (filter === 'all') return true;
    if (filter === 'bestseller') return product.isBestseller;
    if (filter === 'new') return product.isNew;
    if (filter === 'trending') return product.isTrending;
    return true;
  });

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-sm text-primary tracking-widest uppercase mb-2">
            Curated Selection
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6">
            Our Finest Pieces
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked treasures that have captured hearts across India. Each piece embodies 
            the perfect blend of traditional craftsmanship and contemporary design.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-6 py-2 rounded-full font-body text-sm tracking-wide transition-all duration-300 ${
                filter === item.id
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'bg-background text-foreground hover:bg-muted'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.slice(0, 8).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              isLoading={isLoading}
              className="animate-fade-in"
            />
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link to="/shop">
            <Button variant="luxury-outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestsellersGrid;
