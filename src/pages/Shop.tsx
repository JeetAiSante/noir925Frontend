import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Grid3X3, Grid2X2, SlidersHorizontal, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { products, categories } from '@/data/products';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [gridSize, setGridSize] = useState<'large' | 'small'>('large');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [showFilters, setShowFilters] = useState(false);

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

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">Shop</span>
          {selectedCategory && (
            <>
              <span>/</span>
              <span className="text-foreground capitalize">{selectedCategory}</span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            {selectedCategory ? (
              <span className="capitalize">{selectedCategory}</span>
            ) : (
              'All Jewellery'
            )}
          </h1>
          <p className="font-body text-lg text-muted-foreground">
            {filteredProducts.length} pieces of handcrafted silver elegance
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 20000) && (
                <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>

            {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 20000) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
                <X className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-input rounded-lg bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="hidden md:flex items-center gap-1 border border-input rounded-lg overflow-hidden">
              <button
                onClick={() => setGridSize('large')}
                className={`p-2 ${gridSize === 'large' ? 'bg-muted' : 'hover:bg-muted/50'}`}
              >
                <Grid2X2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setGridSize('small')}
                className={`p-2 ${gridSize === 'small' ? 'bg-muted' : 'hover:bg-muted/50'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 shrink-0 space-y-8`}
          >
            {/* Categories */}
            <div>
              <h3 className="font-display text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {cat.name}
                    <span className="float-right text-muted-foreground">
                      ({cat.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-display text-lg mb-4">Price Range</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    className="w-full px-3 py-2 border border-input rounded-lg font-body text-sm"
                    placeholder="Min"
                  />
                  <span className="text-muted-foreground">—</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    className="w-full px-3 py-2 border border-input rounded-lg font-body text-sm"
                    placeholder="Max"
                  />
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
              <div className="text-center py-16">
                <p className="font-display text-2xl text-muted-foreground mb-4">
                  No products found
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
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
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
