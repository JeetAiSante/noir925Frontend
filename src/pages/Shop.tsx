import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Filter, Grid3X3, Grid2X2, X, ChevronRight, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { useCategoriesWithCounts, useTotalProductCount } from '@/hooks/useProductCounts';
import { useShopProducts } from '@/hooks/useShopProducts';
import { useCurrency } from '@/context/CurrencyContext';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import FloatingSpinWheel from '@/components/shop/FloatingSpinWheel';
import MobileFilterDrawer from '@/components/shop/MobileFilterDrawer';
import { SEOHead, CollectionSchema, ItemListSchema } from '@/components/seo/SEOHead';
import { BreadcrumbSchema } from '@/components/seo/ProductSchema';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator, PullToRefreshWrapper } from '@/components/ui/pull-to-refresh';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category');
  const genderParam = searchParams.get('gender');
  const { settings: layoutSettings } = useLayoutSettings();
  const isMobile = useIsMobile();
  
  const [gridSize, setGridSize] = useState<'large' | 'small'>('large');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL params with state
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Handle category change with URL update
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

  const { data: categories = [] } = useCategoriesWithCounts();
  const { data: totalCount = 0 } = useTotalProductCount();
  const { formatPrice } = useCurrency();

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  // Use database-backed hook for filtering
  const { data: filteredProducts = [], isLoading, refetch } = useShopProducts({
    category: selectedCategory,
    gender: genderParam,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    minRating: minRating,
    sortBy: sortBy,
  });

  // Pull to refresh functionality
  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success('Products refreshed', { duration: 2000 });
  }, [refetch]);

  const {
    pullDistance,
    isRefreshing,
    canRefresh,
    pullProgress,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    disabled: !isMobile,
  });

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 20000]);
    setMinRating(0);
    setSortBy('featured');
  };

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < 20000 || minRating > 0;

  const categoryTitle = selectedCategory 
    ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} - Silver Jewellery`
    : 'Shop All Silver Jewellery';
    
  const categoryDescription = selectedCategory
    ? `Shop premium 925 sterling silver ${selectedCategory} at NOIR925. Handcrafted with love, BIS Hallmark certified. Free shipping on orders above ₹2000.`
    : 'Explore our complete collection of handcrafted 925 sterling silver jewellery. Rings, necklaces, bracelets, earrings & more with BIS Hallmark certification.';

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    ...(selectedCategory ? [{ name: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1), url: `/shop?category=${selectedCategory}` }] : [])
  ];

  return (
    <div 
      className="min-h-screen bg-background"
      {...(isMobile ? pullHandlers : {})}
    >
      {/* Pull to Refresh Indicator - Mobile Only */}
      {isMobile && (
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          canRefresh={canRefresh}
          pullProgress={pullProgress}
        />
      )}
      
      <SEOHead 
        title={categoryTitle}
        description={categoryDescription}
        keywords={`925 sterling silver ${selectedCategory || 'jewellery'}, silver ${selectedCategory || 'jewelry'} online India, ${selectedCategory || 'luxury jewellery'} for women, handcrafted silver, BIS hallmark silver ${selectedCategory || ''}`}
        canonicalUrl={`https://noir925.com/shop${selectedCategory ? `?category=${selectedCategory}` : ''}`}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <CollectionSchema 
        name={categoryTitle}
        description={categoryDescription}
        url={`https://noir925.com/shop${selectedCategory ? `?category=${selectedCategory}` : ''}`}
        productCount={filteredProducts.length}
      />
      {filteredProducts.length > 0 && (
        <ItemListSchema 
          products={filteredProducts.slice(0, 10).map((p, i) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            position: i + 1
          }))}
          listName={categoryTitle}
        />
      )}
      <Header />
      <PullToRefreshWrapper 
        pullDistance={isMobile ? pullDistance : 0} 
        isRefreshing={isRefreshing}
      >
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
          {/* Quick Filters - Sticky Pills */}
          <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md py-3 -mx-4 px-4 md:px-6 lg:px-8 mb-4 border-b border-border/50">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => {
                  setPriceRange([0, 999]);
                  setSortBy('featured');
                }}
                className="shrink-0 px-4 py-2 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground text-sm font-medium transition-all border border-secondary/20 shadow-sm"
              >
                Under {formatPrice(999)}
              </button>
              <button
                onClick={() => {
                  setSortBy('rating');
                  setSelectedCategory(null);
                }}
                className="shrink-0 px-4 py-2 rounded-full bg-accent/80 hover:bg-accent text-accent-foreground text-sm font-medium transition-all border border-accent/20 shadow-sm"
              >
                Best Sellers
              </button>
              <button
                onClick={() => {
                  setSortBy('newest');
                  setSelectedCategory(null);
                }}
                className="shrink-0 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-all border border-primary/20"
              >
                New Arrivals
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSortBy('featured');
                  // Filter will show on-sale items from the filtered products
                }}
                className="shrink-0 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500/10 to-pink-500/10 hover:from-rose-500/20 hover:to-pink-500/20 text-foreground text-sm font-medium transition-all border border-rose-500/20"
              >
                On Sale
              </button>
            </div>
          </div>

          {/* Category Pills - Quick Filter */}
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
              {/* Mobile Filter Drawer */}
              <MobileFilterDrawer
                categories={categories.map(c => ({ id: c.id, name: c.name, productCount: c.productCount }))}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                totalProducts={totalCount}
                filteredCount={filteredProducts.length}
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
            <aside
              className={`${
                showFilters ? 'block' : 'hidden'
              } hidden lg:block w-full lg:w-60 shrink-0 space-y-6`}
            >
              {/* Categories */}
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-display text-base mb-4">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange(null)}
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
                      onClick={() => handleCategoryChange(cat.name.toLowerCase())}
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
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="shop-products-grid grid gap-4 md:gap-6">
                  <style>{`
                    .shop-products-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowMobile}, 1fr); }
                    @media (min-width: 640px) {
                      .shop-products-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowTablet}, 1fr); }
                    }
                    @media (min-width: 1024px) {
                      .shop-products-grid { grid-template-columns: repeat(${gridSize === 'large' ? Math.min(layoutSettings.productsPerRow, 3) : layoutSettings.productsPerRow}, 1fr); }
                    }
                  `}</style>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
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
                <>
                  <style>{`
                    .shop-products-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowMobile}, 1fr); }
                    @media (min-width: 640px) {
                      .shop-products-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowTablet}, 1fr); }
                    }
                    @media (min-width: 1024px) {
                      .shop-products-grid { grid-template-columns: repeat(${gridSize === 'large' ? Math.min(layoutSettings.productsPerRow, 3) : layoutSettings.productsPerRow}, 1fr); }
                    }
                  `}</style>
                  <div className="shop-products-grid grid gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      </PullToRefreshWrapper>

      <FloatingSpinWheel />
      <Footer />
    </div>
  );
};

export default Shop;
