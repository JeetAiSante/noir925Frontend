import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight, Sparkles, Star, Zap, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products, categories, formatPrice } from '@/data/products';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

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

// Generate local fallback suggestions
const generateLocalSuggestions = (query: string): string[] => {
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  const suggestions = new Set<string>();
  
  // Add product names that match
  products.forEach(p => {
    if (p.name.toLowerCase().includes(q)) {
      suggestions.add(p.name);
    }
  });
  
  // Add category-based suggestions
  categories.forEach(c => {
    if (c.name.toLowerCase().includes(q)) {
      suggestions.add(c.name);
      suggestions.add(`${c.name} for Women`);
      suggestions.add(`${c.name} for Men`);
    }
  });

  // Add common search patterns
  const patterns = ['silver', 'gold plated', 'oxidized', 'antique', 'bridal', 'daily wear', 'party wear'];
  patterns.forEach(pattern => {
    if (pattern.includes(q) || q.includes(pattern.split(' ')[0])) {
      suggestions.add(`${pattern} jewellery`);
    }
  });

  return Array.from(suggestions).slice(0, 5);
};

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof products>([]);
  const [categoryResults, setCategoryResults] = useState<typeof categories>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiRequestRef = useRef<AbortController | null>(null);

  // Use local suggestions as fallback, prioritize AI suggestions when available
  const suggestions = useMemo(() => {
    if (aiSuggestions.length > 0) return aiSuggestions;
    return generateLocalSuggestions(query);
  }, [query, aiSuggestions]);

  // Fetch AI suggestions
  const fetchAISuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setAiSuggestions([]);
      return;
    }

    // Cancel previous request
    if (aiRequestRef.current) {
      aiRequestRef.current.abort();
    }

    aiRequestRef.current = new AbortController();
    setIsLoadingAI(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-search-suggest', {
        body: {
          query: searchQuery,
          products: products.slice(0, 20).map(p => p.name),
          categories: categories.map(c => c.name),
        },
      });

      if (error) throw error;
      
      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setAiSuggestions(data.suggestions);
      }
    } catch (err) {
      // Use local suggestions as fallback
      console.log('Using local suggestions fallback');
      setAiSuggestions([]);
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setCategoryResults([]);
      setSelectedSuggestion(-1);
      setAiSuggestions([]);
    }
  }, [open]);

  // Trigger AI suggestions when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAISuggestions(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchAISuggestions]);

  useEffect(() => {
    setIsTyping(true);
    setSelectedSuggestion(-1);
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
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

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

  const featuredProducts = products.slice(0, 4);

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
                    <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100" />
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
                  <p className="font-medium text-sm">AI-Powered Search</p>
                  <p className="text-xs text-muted-foreground truncate">Find exactly what you're looking for</p>
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
              <div>
                <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Popular
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => handleSearch(product.name)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <img 
                        src={product.images?.[0] || product.image} 
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

              {/* Popular Categories - 3 column grid */}
              <div>
                <h4 className="text-xs font-medium text-foreground mb-2">Categories</h4>
                <div className="grid grid-cols-3 gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.name.toLowerCase()}`}
                      onClick={() => onOpenChange(false)}
                      className="group relative aspect-[4/3] rounded-lg overflow-hidden"
                    >
                      <img 
                        src={cat.image} 
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
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Loading State */}
              {isTyping && (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {!isTyping && (
                <>
                  {/* Categories */}
                  {categoryResults.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Categories</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {categoryResults.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/shop?category=${cat.name.toLowerCase()}`}
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
                  {results.length > 0 ? (
                    <div>
                      <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Products</h4>
                      <div className="space-y-1">
                        {results.map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            onClick={() => handleSearch(product.name)}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
                          >
                            <img 
                              src={product.images?.[0] || product.image} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                              <div className="flex items-center gap-2 mt-0.5">
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

                  {results.length > 0 && (
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