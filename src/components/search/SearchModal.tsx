import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight, Sparkles, Star, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products, categories, formatPrice } from '@/data/products';
import { Link } from 'react-router-dom';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const trendingSearches = ['Silver Rings', 'Bridal Collection', 'Floral Earrings', 'Daily Wear', 'Oxidised Silver'];

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem('noir925_recent_searches') || '[]').slice(0, 5);
  } catch {
    return [];
  }
};

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof products>([]);
  const [categoryResults, setCategoryResults] = useState<typeof categories>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setCategoryResults([]);
    }
  }, [open]);

  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      if (query.length > 1) {
        const searchLower = query.toLowerCase();
        const filtered = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
        ).slice(0, 6);
        setResults(filtered);
        
        const catFiltered = categories.filter(c => 
          c.name.toLowerCase().includes(searchLower)
        );
        setCategoryResults(catFiltered);
      } else {
        setResults([]);
        setCategoryResults([]);
      }
      setIsTyping(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (term: string) => {
    const recent = getRecentSearches();
    const updated = [term, ...recent.filter((r: string) => r !== term)].slice(0, 10);
    localStorage.setItem('noir925_recent_searches', JSON.stringify(updated));
    onOpenChange(false);
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('noir925_recent_searches');
    setRecentSearches([]);
  };

  const featuredProducts = products.slice(0, 4);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-background border-border overflow-hidden">
        <DialogTitle className="sr-only">Search NOIR925</DialogTitle>
        
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4 bg-muted/30">
          <Search className="w-5 h-5 text-primary" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for silver jewellery..."
            className="border-0 focus-visible:ring-0 text-base py-5 bg-transparent placeholder:text-muted-foreground/60"
          />
          {query && (
            <Button variant="ghost" size="icon" onClick={() => setQuery('')} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="max-h-[65vh] overflow-y-auto">
          {query.length <= 1 ? (
            <div className="p-5 space-y-6">
              {/* AI Suggestions Banner */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl border border-primary/20">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">AI-Powered Search</p>
                  <p className="text-xs text-muted-foreground">Find exactly what you're looking for</p>
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" /> Recent Searches
                    </h4>
                    <button 
                      onClick={clearRecentSearches}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search: string) => (
                      <Badge
                        key={search}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 px-3 py-1.5"
                        onClick={() => {
                          setQuery(search);
                          handleSearch(search);
                        }}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Trending Now
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search, i) => (
                    <Badge
                      key={search}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 px-3 py-1.5"
                      onClick={() => setQuery(search)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Featured Products */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" /> Popular Products
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => handleSearch(product.name)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <img 
                        src={product.images?.[0] || product.image} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-primary font-semibold">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Shop by Category</h4>
                <div className="grid grid-cols-3 gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.name.toLowerCase()}`}
                      onClick={() => onOpenChange(false)}
                      className="group relative aspect-square rounded-xl overflow-hidden"
                    >
                      <img 
                        src={cat.image} 
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium text-center">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Loading State */}
              {isTyping && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {!isTyping && (
                <>
                  {/* Categories */}
                  {categoryResults.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {categoryResults.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/shop?category=${cat.name.toLowerCase()}`}
                            onClick={() => handleSearch(cat.name)}
                          >
                            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                              {cat.name}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {results.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Products</h4>
                      <div className="space-y-1">
                        {results.map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            onClick={() => handleSearch(product.name)}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors group"
                          >
                            <img 
                              src={product.images?.[0] || product.image} 
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-semibold text-primary">
                                  {formatPrice(product.price)}
                                </p>
                                {product.originalPrice && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-2">No products found for "{query}"</p>
                      <Link 
                        to={`/shop?search=${encodeURIComponent(query)}`}
                        onClick={() => handleSearch(query)}
                        className="text-primary hover:underline text-sm"
                      >
                        Browse all products
                      </Link>
                    </div>
                  )}

                  {results.length > 0 && (
                    <Link 
                      to={`/shop?search=${encodeURIComponent(query)}`}
                      onClick={() => handleSearch(query)}
                      className="flex items-center justify-center gap-2 py-3 text-primary hover:underline text-sm"
                    >
                      View all results for "{query}" <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;