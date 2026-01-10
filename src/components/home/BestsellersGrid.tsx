import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { useHomepageSections } from '@/hooks/useHomepageSections';

const BestsellersGrid = () => {
  const [filter, setFilter] = useState('all');
  const { data: allProducts = [], isLoading } = useProducts({ limit: 12 });
  const { data: bestsellers = [] } = useProducts({ bestseller: true, limit: 12 });
  const { data: newProducts = [] } = useProducts({ new: true, limit: 12 });
  const { data: trendingProducts = [] } = useProducts({ trending: true, limit: 12 });
  const { settings: layoutSettings } = useLayoutSettings();
  
  // Get section settings for custom title/subtitle
  const { getSectionSettings } = useHomepageSections();
  const sectionSettings = getSectionSettings('bestsellers');

  const filters = [
    { id: 'all', name: 'All' },
    { id: 'bestseller', name: 'Bestsellers' },
    { id: 'new', name: 'New Arrivals' },
    { id: 'trending', name: 'Trending' },
  ];

  const getFilteredProducts = () => {
    switch (filter) {
      case 'bestseller':
        return bestsellers.length > 0 ? bestsellers : allProducts.filter(p => p.isBestseller);
      case 'new':
        return newProducts.length > 0 ? newProducts : allProducts.filter(p => p.isNew);
      case 'trending':
        return trendingProducts.length > 0 ? trendingProducts : allProducts.filter(p => p.isTrending);
      default:
        return allProducts;
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-sm text-primary tracking-widest uppercase mb-2">
            {sectionSettings?.customSubtitle || 'Curated Selection'}
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6">
            {sectionSettings?.customTitle || 'Our Finest Pieces'}
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

        {/* Products Grid with dynamic layout */}
        <style>{`
          .bestsellers-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowMobile}, 1fr); }
          @media (min-width: 640px) {
            .bestsellers-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowTablet}, 1fr); }
          }
          @media (min-width: 1024px) {
            .bestsellers-grid { grid-template-columns: repeat(${layoutSettings.productsPerRow}, 1fr); }
          }
        `}</style>
        <div className="bestsellers-grid grid gap-4 md:gap-6">
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
