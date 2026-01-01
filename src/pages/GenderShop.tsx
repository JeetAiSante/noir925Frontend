import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Grid3X3, Grid2X2, X, ChevronRight, Star, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { useCategoriesWithCounts } from '@/hooks/useProductCounts';
import { useShopProducts } from '@/hooks/useShopProducts';
import { useCurrency } from '@/context/CurrencyContext';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import MobileFilterDrawer from '@/components/shop/MobileFilterDrawer';
import { SEOHead } from '@/components/seo/SEOHead';
import { BreadcrumbSchema } from '@/components/seo/ProductSchema';

const GenderShop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genderParam = searchParams.get('gender') || 'women';
  const categoryParam = searchParams.get('category');
  const { settings: layoutSettings } = useLayoutSettings();
  
  const [gridSize, setGridSize] = useState<'large' | 'small'>('large');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const isForHim = genderParam === 'men';
  const genderLabel = isForHim ? 'For Him' : 'For Her';
  const genderDescription = isForHim 
    ? 'Bold and masculine silver jewelry crafted for the modern gentleman'
    : 'Elegant and timeless silver jewelry designed for the contemporary woman';

  // Sync URL params with state
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const { data: categories = [] } = useCategoriesWithCounts();
  const { formatPrice } = useCurrency();

  const { data: products = [], isLoading } = useShopProducts({
    category: selectedCategory,
    gender: genderParam,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    minRating: minRating,
    sortBy: sortBy,
  });

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category.toLowerCase());
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams, { replace: true });
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 20000]);
    setMinRating(0);
    setSortBy('featured');
    const newParams = new URLSearchParams();
    newParams.set('gender', genderParam);
    setSearchParams(newParams, { replace: true });
  };

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < 20000 || minRating > 0;

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: genderLabel, url: `/shop?gender=${genderParam}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${genderLabel} - Silver Jewelry Collection | NOIR925`}
        description={genderDescription}
        keywords={`silver jewelry ${genderLabel.toLowerCase()}, ${genderParam} silver accessories, 925 sterling silver ${genderParam}`}
        canonicalUrl={`https://noir925.com/shop?gender=${genderParam}`}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <Header />

      <main className="pt-4 pb-16">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{genderLabel}</span>
          </nav>
        </div>

        {/* Hero Header */}
        <div className={`relative py-16 md:py-20 mb-8 overflow-hidden ${
          isForHim 
            ? 'bg-gradient-to-r from-blue-900/20 via-slate-800/10 to-blue-900/20' 
            : 'bg-gradient-to-r from-pink-900/20 via-rose-800/10 to-pink-900/20'
        }`}>
          <div className="container mx-auto px-4 relative">
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Products
            </Link>
            <div className="text-center max-w-2xl mx-auto">
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-4 tracking-wide ${
                isForHim 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-pink-500/20 text-pink-400'
              }`}>
                {products.length} Products
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
                {genderLabel}
              </h1>
              <p className="font-body text-muted-foreground text-lg">
                {genderDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Gender Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-full p-1 bg-muted">
              <Link
                to="/shop-for?gender=women"
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  genderParam === 'women'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                For Her
              </Link>
              <Link
                to="/shop-for?gender=men"
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  genderParam === 'men'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                For Him
              </Link>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange(null)}
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
                onClick={() => handleCategoryChange(cat.name.toLowerCase())}
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
              <MobileFilterDrawer
                categories={categories.map(c => ({ id: c.id, name: c.name, productCount: c.productCount }))}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                totalProducts={products.length}
                filteredCount={products.length}
                onClearFilters={clearFilters}
                minRating={minRating}
                setMinRating={setMinRating}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="hidden md:flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>

              {hasActiveFilters && (
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
            {/* Sidebar Filters - Desktop Only */}
            <aside className={`${showFilters ? 'block' : 'hidden'} hidden lg:block w-full lg:w-60 shrink-0 space-y-6`}>
              {/* Rating Filter */}
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-display text-base mb-4">Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                      className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        minRating === rating
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rating
                                ? minRating === rating 
                                  ? 'fill-primary-foreground text-primary-foreground' 
                                  : 'fill-accent text-accent'
                                : minRating === rating
                                  ? 'text-primary-foreground/40'
                                  : 'text-border'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1">{rating}+ stars</span>
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
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-display text-xl text-foreground mb-2">
                    No products found
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or check back later
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <>
                  <style>{`
                    .gender-shop-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowMobile}, 1fr); }
                    @media (min-width: 640px) {
                      .gender-shop-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowTablet}, 1fr); }
                    }
                    @media (min-width: 1024px) {
                      .gender-shop-grid { grid-template-columns: repeat(${gridSize === 'large' ? Math.min(layoutSettings.productsPerRow, 3) : layoutSettings.productsPerRow}, 1fr); }
                    }
                  `}</style>
                  <div className="gender-shop-grid grid gap-4 md:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GenderShop;
