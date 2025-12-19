import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react';
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

const trendingSearches = ['Silver Rings', 'Bridal Collection', 'Floral Earrings', 'Daily Wear'];
const recentSearches = JSON.parse(localStorage.getItem('noir925_recent_searches') || '[]').slice(0, 5);

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof products>([]);
  const [categoryResults, setCategoryResults] = useState<typeof categories>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
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
  }, [query]);

  const handleSearch = (term: string) => {
    const recent = JSON.parse(localStorage.getItem('noir925_recent_searches') || '[]');
    const updated = [term, ...recent.filter((r: string) => r !== term)].slice(0, 10);
    localStorage.setItem('noir925_recent_searches', JSON.stringify(updated));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">
        <DialogTitle className="sr-only">Search NOIR925</DialogTitle>
        <div className="flex items-center border-b border-border/50 px-4">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for silver jewellery..."
            className="border-0 focus-visible:ring-0 text-lg py-6 bg-transparent"
          />
          {query && (
            <Button variant="ghost" size="icon" onClick={() => setQuery('')}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length <= 1 ? (
            <div className="p-6 space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Recent Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search: string) => (
                      <Badge
                        key={search}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
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

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Trending Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search) => (
                    <Badge
                      key={search}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      onClick={() => setQuery(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Popular Categories</h4>
                <div className="grid grid-cols-3 gap-3">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.name.toLowerCase()}`}
                      onClick={() => onOpenChange(false)}
                      className="group relative aspect-square rounded-lg overflow-hidden"
                    >
                      <img 
                        src={cat.image} 
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-white text-sm font-medium">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {categoryResults.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {categoryResults.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.name.toLowerCase()}`}
                        onClick={() => {
                          handleSearch(cat.name);
                        }}
                      >
                        <Badge variant="secondary" className="cursor-pointer">
                          {cat.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.length > 0 ? (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Products</h4>
                  <div className="space-y-2">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => handleSearch(product.name)}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                      >
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice(product.price)}
                            {product.originalPrice && (
                              <span className="text-muted-foreground line-through ml-2">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No products found for "{query}"</p>
                  <Link 
                    to={`/shop?search=${encodeURIComponent(query)}`}
                    onClick={() => handleSearch(query)}
                    className="text-primary hover:underline mt-2 inline-block"
                  >
                    View all results
                  </Link>
                </div>
              )}

              {results.length > 0 && (
                <Link 
                  to={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={() => handleSearch(query)}
                  className="flex items-center justify-center gap-2 py-3 text-primary hover:underline"
                >
                  View all results for "{query}" <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
