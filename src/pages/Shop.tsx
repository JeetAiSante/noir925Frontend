import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Grid3X3, Grid2X2, X, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';
import { useCategoriesWithCounts, useTotalProductCount } from '@/hooks/useProductCounts';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [gridSize, setGridSize] = useState<'large' | 'small'>('large');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useCategoriesWithCounts();
  const { data: totalCount = products.length } = useTotalProductCount();

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory) {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by price
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [selectedCategory, priceRange, sortBy]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 20000]);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-4 pb-16">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Shop</span>
            {selectedCategory && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium capitalize">{selectedCategory}</span>
              </>
            )}
          </nav>
        </div>

        {/* Hero Header */}
        <div className="relative py-12 md:py-16 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-accent/5" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 tracking-wide">
                {totalCount} Products
              </span>
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                {selectedCategory ? (
                  <span className="capitalize">{selectedCategory}</span>
                ) : (
                  <>
                    Our <span className="text-primary">Collection</span>
                  </>
                )}
              </h1>
              <p className="font-body text-muted-foreground">
                {filteredProducts.length} pieces of handcrafted silver elegance
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Category Pills - Quick Filter */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full font-body text-sm transition-all ${
                !selectedCategory
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name.toLowerCase())}
                className={`shrink-0 px-4 py-2 rounded-full font-body text-sm transition-all flex items-center gap-2 ${
                  selectedCategory === cat.name.toLowerCase()
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-xs ${
                  selectedCategory === cat.name.toLowerCase() 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                }`}>
                  ({cat.productCount})
                </span>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 20000) && (
                  <span className="w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>

              {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 20000) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                  Clear All
                  <X className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-input rounded-lg bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="hidden md:flex items-center border border-input rounded-lg overflow-hidden">
                <button
                  onClick={() => setGridSize('large')}
                  className={`p-2 transition-colors ${gridSize === 'large' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  aria-label="Large grid"
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridSize('small')}
                  className={`p-2 transition-colors ${gridSize === 'small' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  aria-label="Small grid"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside
              className={`${
                showFilters ? 'block' : 'hidden'
              } lg:block w-full lg:w-60 shrink-0 space-y-6`}
            >
              {/* Categories */}
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-display text-base mb-4">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                      !selectedCategory
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className={!selectedCategory ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
                      {totalCount}
                    </span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name.toLowerCase())}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                        selectedCategory === cat.name.toLowerCase()
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`${
                        selectedCategory === cat.name.toLowerCase()
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}>
                        {cat.productCount}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-display text-base mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                        className="w-full px-3 py-2 border border-input rounded-lg font-body text-sm bg-background"
                      />
                    </div>
                    <span className="text-muted-foreground mt-5">—</span>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                        className="w-full px-3 py-2 border border-input rounded-lg font-body text-sm bg-background"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-display text-xl text-foreground mb-2">
                    No products found
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <div
                  className={`grid gap-4 md:gap-6 ${
                    gridSize === 'large'
                      ? 'grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  }`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
