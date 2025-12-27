import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Grid, LayoutGrid, X, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { SEOHead } from '@/components/seo/SEOHead';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [gridSize, setGridSize] = useState<2 | 4>(4);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const filteredProducts = useMemo(() => {
    if (!query) return [];

    let filtered = products.filter(product => {
      const searchLower = query.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower);
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // relevance - keep original order based on search match quality
        break;
    }

    return filtered;
  }, [products, query, selectedCategory, priceRange, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 50000]);
    setSortBy('relevance');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={0}
            max={50000}
            step={500}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <>
      <SEOHead
        title={query ? `Search results for "${query}" | NOIR925` : 'Search | NOIR925'}
        description={`Find premium silver jewellery matching "${query}". Browse our collection of handcrafted 925 sterling silver pieces.`}
      />
      
      <Header />
      
      <main className="min-h-screen bg-background pt-20">
        {/* Search Header */}
        <div className="bg-gradient-to-b from-muted/50 to-background py-8 md:py-12">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for jewellery..."
                  className="pl-12 pr-24 py-6 text-lg rounded-full border-2 border-border focus:border-primary"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                >
                  Search
                </Button>
              </div>
            </form>
            
            {query && (
              <div className="text-center mt-6">
                <h1 className="text-2xl md:text-3xl font-serif text-foreground">
                  Search results for "<span className="text-primary">{query}</span>"
                </h1>
                <p className="text-muted-foreground mt-2">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
            )}
          </div>
        </div>

        {query && (
          <div className="container mx-auto px-4 py-8">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2">
                {/* Mobile Filter */}
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Active filters */}
                {(selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 50000) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {selectedCategory}
                        <button onClick={() => setSelectedCategory('all')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        ₹{priceRange[0]} - ₹{priceRange[1]}
                        <button onClick={() => setPriceRange([0, 50000])}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* Grid Toggle */}
                <div className="hidden md:flex items-center gap-1 border rounded-lg p-1">
                  <button
                    onClick={() => setGridSize(2)}
                    className={`p-2 rounded ${gridSize === 2 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridSize(4)}
                    className={`p-2 rounded ${gridSize === 4 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-8">
              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24 bg-card rounded-xl p-6 border">
                  <h2 className="font-semibold text-lg mb-4">Filters</h2>
                  <FilterContent />
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-square bg-muted rounded-lg mb-3" />
                        <div className="h-4 bg-muted rounded mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className={`grid gap-4 md:gap-6 ${
                    gridSize === 2 
                      ? 'grid-cols-1 md:grid-cols-2' 
                      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  }`}>
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-foreground mb-2">No products found</h2>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                      <Button asChild>
                        <Link to="/shop">Browse All Products</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State when no query */}
        {!query && (
          <div className="container mx-auto px-4 py-16 text-center">
            <Search className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-medium text-foreground mb-3">Start your search</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Enter a search term to discover our collection of premium silver jewellery.
            </p>
            <Button asChild size="lg">
              <Link to="/shop">Browse All Products</Link>
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
};

export default SearchResults;
