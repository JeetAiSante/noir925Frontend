import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight, Sparkles, Star, Zap, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/context/CurrencyContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DbProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  images: string[];
  category_id: string | null;
  is_new: boolean;
  is_bestseller: boolean;
}

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

const trendingSearches = ['Silver Rings', 'Bridal Collection', 'Floral Earrings', 'Daily Wear', 'Oxidised Silver'];

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem('noir925_recent_searches') || '[]').slice(0, 5);
  } catch {
    return [];
  }
};

// Fuzzy matching helper - checks if query words appear in text
const fuzzyMatch = (text: string, query: string): boolean => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
  
  // Check if all query words are in the text
  return queryWords.every(word => textLower.includes(word));
};

// Calculate match score for sorting
const calculateMatchScore = (text: string, query: string): number => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === queryLower) return 100;
  
  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return 80;
  
  // Contains exact query phrase
  if (textLower.includes(queryLower)) return 60;
  
  // Count matching words
  const queryWords = queryLower.split(/\s+/);
  const matchingWords = queryWords.filter(w => textLower.includes(w)).length;
  
  return (matchingWords / queryWords.length) * 40;
};

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const { formatPrice } = useCurrency();
  const [query, setQuery] = useState('');
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<DbProduct[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<DbCategory[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial data on mount
  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, slug, price, original_price, images, category_id, is_new, is_bestseller')
          .eq('is_active', true)
          .order('is_bestseller', { ascending: false })
          .limit(100),
        supabase
          .from('categories')
          .select('id, name, slug, image_url')
          .eq('is_active', true)
          .order('sort_order')
      ]);
      
      if (productsRes.data) {
        setDbProducts(productsRes.data.map(p => ({
          ...p,
          images: Array.isArray(p.images) ? (p.images as string[]) : []
        })) as DbProduct[]);
      }
      if (categoriesRes.data) {
        setDbCategories(categoriesRes.data);
      }
    };
    
    if (open) {
      fetchData();
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setFilteredProducts([]);
      setFilteredCategories([]);
      setSelectedSuggestion(-1);
      setSuggestions([]);
    }
  }, [open]);

  // Real-time search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setFilteredProducts([]);
      setFilteredCategories([]);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    searchTimeoutRef.current = setTimeout(async () => {
      const queryLower = query.toLowerCase();
      
      // Filter products with fuzzy matching and scoring
      const matchedProducts = dbProducts
        .filter(p => fuzzyMatch(p.name, query))
        .map(p => ({ ...p, score: calculateMatchScore(p.name, query) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
      
      // Filter categories
      const matchedCategories = dbCategories
        .filter(c => c.name.toLowerCase().includes(queryLower) || 
                     c.slug.toLowerCase().includes(queryLower));
      
      // Generate smart suggestions
      const newSuggestions = new Set<string>();
      
      // Add matching product names as suggestions
      matchedProducts.slice(0, 3).forEach(p => {
        newSuggestions.add(p.name);
      });
      
      // Add matching category names
      matchedCategories.forEach(c => {
        newSuggestions.add(c.name);
        newSuggestions.add(`${c.name} for Women`);
        newSuggestions.add(`${c.name} for Men`);
      });
      
      // Add common search patterns if query matches
      const commonPatterns = [
        'silver rings', 'gold plated', 'oxidized silver', 'bridal jewelry',
        'daily wear', 'party wear', 'traditional', 'modern', 'minimalist'
      ];
      commonPatterns.forEach(pattern => {
        if (pattern.includes(queryLower) || queryLower.split(' ').some(w => pattern.includes(w))) {
          newSuggestions.add(pattern.charAt(0).toUpperCase() + pattern.slice(1));
        }
      });

      setFilteredProducts(matchedProducts);
      setFilteredCategories(matchedCategories);
      setSuggestions(Array.from(newSuggestions).slice(0, 6));
      setIsLoading(false);
    }, 150);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, dbProducts, dbCategories]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
      e.preventDefault();
      setQuery(suggestions[selectedSuggestion]);
    }
  };

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

  // Get featured products for initial state
  const featuredProducts = useMemo(() => 
    dbProducts.filter(p => p.is_bestseller || p.is_new).slice(0, 4),
    [dbProducts]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-background border-border overflow-hidden z-[100] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <DialogTitle className="sr-only">Search NOIR925</DialogTitle>
        
        {/* Search Input */}
        <div className="relative border-b border-border bg-muted/30">
          <div className="flex items-center px-4">
            <Search className="w-5 h-5 text-primary flex-shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for silver jewellery..."
              className="border-0 focus-visible:ring-0 text-base py-5 bg-transparent placeholder:text-muted-foreground/60 flex-1"
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2" />
            )}
            {query && (
              <Button variant="ghost" size="icon" onClick={() => setQuery('')} className="h-8 w-8 flex-shrink-0">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Autocomplete Suggestions Dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && query.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-lg z-50"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      selectedSuggestion === index ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                  >
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">
                      {suggestion.split(new RegExp(`(${query})`, 'gi')).map((part, i) => (
                        <span key={i} className={part.toLowerCase() === query.toLowerCase() ? 'font-bold text-primary' : ''}>
                          {part}
                        </span>
                      ))}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
          {query.length <= 1 ? (
            <div className="p-4 space-y-5">
              {/* AI Suggestions Banner */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-lg border border-primary/20">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">Smart Search</p>
                  <p className="text-xs text-muted-foreground truncate">Type to find products instantly</p>
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Recent
                    </h4>
                    <button 
                      onClick={clearRecentSearches}
                      className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((search: string) => (
                      <Badge
                        key={search}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all text-xs px-2.5 py-1"
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
                <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" /> Trending
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {trendingSearches.map((search) => (
                    <Badge
                      key={search}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-xs px-2.5 py-1"
                      onClick={() => setQuery(search)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Featured Products - 2 column grid */}
              {featuredProducts.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500" /> Popular
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {featuredProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug || product.id}`}
                        onClick={() => handleSearch(product.name)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <img 
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100'} 
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
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
              )}

              {/* Popular Categories - 3 column grid */}
              {dbCategories.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-foreground mb-2">Categories</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {dbCategories.slice(0, 6).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="group relative aspect-[4/3] rounded-lg overflow-hidden"
                      >
                        <img 
                          src={cat.image_url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200'} 
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-[10px] font-medium text-center truncate">
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {!isLoading && (
                <>
                  {/* Categories */}
                  {filteredCategories.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Categories</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {filteredCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/shop?category=${cat.slug}`}
                            onClick={() => handleSearch(cat.name)}
                          >
                            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs">
                              {cat.name}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {filteredProducts.length > 0 ? (
                    <div>
                      <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Products</h4>
                      <div className="space-y-1">
                        {filteredProducts.map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.slug || product.id}`}
                            onClick={() => handleSearch(product.name)}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
                          >
                            <img 
                              src={product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100'} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-sm font-semibold text-primary">
                                  {formatPrice(product.price)}
                                </p>
                                {product.original_price && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.original_price)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <Search className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">No products found for "{query}"</p>
                      <Link 
                        to={`/shop?search=${encodeURIComponent(query)}`}
                        onClick={() => handleSearch(query)}
                        className="text-primary hover:underline text-sm"
                      >
                        Browse all products
                      </Link>
                    </div>
                  )}

                  {filteredProducts.length > 0 && (
                    <Link 
                      to={`/shop?search=${encodeURIComponent(query)}`}
                      onClick={() => handleSearch(query)}
                      className="flex items-center justify-center gap-2 py-2.5 text-primary hover:underline text-sm"
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