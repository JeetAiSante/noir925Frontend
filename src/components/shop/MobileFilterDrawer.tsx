import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Filter, X, Check, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  productCount: number;
}

interface MobileFilterDrawerProps {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  totalProducts: number;
  filteredCount: number;
  onClearFilters: () => void;
  minRating?: number;
  setMinRating?: (rating: number) => void;
}

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
];

const ratingOptions = [
  { value: 4, label: '4+ Stars', stars: 4 },
  { value: 3, label: '3+ Stars', stars: 3 },
  { value: 2, label: '2+ Stars', stars: 2 },
  { value: 1, label: '1+ Stars', stars: 1 },
];

const MobileFilterDrawer = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  totalProducts,
  filteredCount,
  onClearFilters,
  minRating = 0,
  setMinRating,
}: MobileFilterDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'main' | 'category' | 'price' | 'sort' | 'rating'>('main');

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < 20000 || sortBy !== 'featured' || minRating > 0;
  const filterCount = [
    selectedCategory ? 1 : 0,
    priceRange[0] > 0 || priceRange[1] < 20000 ? 1 : 0,
    sortBy !== 'featured' ? 1 : 0,
    minRating > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleApply = () => {
    setOpen(false);
    setActiveSection('main');
  };

  const handleClear = () => {
    onClearFilters();
    setMinRating?.(0);
    setActiveSection('main');
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 md:hidden">
          <Filter className="w-4 h-4" />
          Filters
          {filterCount > 0 && (
            <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {filterCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh] bg-background">
        <AnimatePresence mode="wait">
          {activeSection === 'main' ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <DrawerHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="font-display text-lg">Filters & Sort</DrawerTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
                      Clear all
                    </Button>
                  )}
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Category Filter */}
                <button
                  onClick={() => setActiveSection('category')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-lg">📂</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Category</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All Categories'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Price Filter */}
                <button
                  onClick={() => setActiveSection('price')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-accent text-lg">💰</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Price Range</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Rating Filter */}
                {setMinRating && (
                  <button
                    onClick={() => setActiveSection('rating')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Star className="w-5 h-5 text-accent fill-accent" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">Rating</p>
                        <p className="text-xs text-muted-foreground">
                          {minRating > 0 ? `${minRating}+ Stars` : 'All Ratings'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}

                {/* Sort */}
                <button
                  onClick={() => setActiveSection('sort')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="text-secondary text-lg">↕️</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Sort By</p>
                      <p className="text-xs text-muted-foreground">
                        {sortOptions.find(o => o.value === sortBy)?.label}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <DrawerFooter className="border-t border-border">
                <Button onClick={handleApply} className="w-full">
                  Show {filteredCount} Products
                </Button>
              </DrawerFooter>
            </motion.div>
          ) : activeSection === 'category' ? (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <DrawerHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveSection('main')} className="p-1 rounded-full hover:bg-muted">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <DrawerTitle className="font-display text-lg">Category</DrawerTitle>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setActiveSection('main');
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium text-sm">All Categories</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">{totalProducts}</span>
                    {!selectedCategory && <Check className="w-4 h-4" />}
                  </div>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name.toLowerCase());
                      setActiveSection('main');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === cat.name.toLowerCase() ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <span className="font-medium text-sm">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">{cat.productCount}</span>
                      {selectedCategory === cat.name.toLowerCase() && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : activeSection === 'price' ? (
            <motion.div
              key="price"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <DrawerHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveSection('main')} className="p-1 rounded-full hover:bg-muted">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <DrawerTitle className="font-display text-lg">Price Range</DrawerTitle>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  </p>
                </div>

                <div className="space-y-4">
                  <Slider
                    value={[priceRange[1]]}
                    min={0}
                    max={20000}
                    step={500}
                    onValueChange={(value) => setPriceRange([priceRange[0], value[0]])}
                    className="w-full"
                  />
                </div>

                {/* Quick price buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Under ₹1000', range: [0, 1000] as [number, number] },
                    { label: '₹1000 - ₹3000', range: [1000, 3000] as [number, number] },
                    { label: '₹3000 - ₹5000', range: [3000, 5000] as [number, number] },
                    { label: 'Above ₹5000', range: [5000, 20000] as [number, number] },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setPriceRange(option.range)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        priceRange[0] === option.range[0] && priceRange[1] === option.range[1]
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <DrawerFooter className="border-t border-border">
                <Button onClick={() => setActiveSection('main')} className="w-full">
                  Apply Price Filter
                </Button>
              </DrawerFooter>
            </motion.div>
          ) : activeSection === 'rating' ? (
            <motion.div
              key="rating"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <DrawerHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveSection('main')} className="p-1 rounded-full hover:bg-muted">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <DrawerTitle className="font-display text-lg">Rating</DrawerTitle>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button
                  onClick={() => {
                    setMinRating?.(0);
                    setActiveSection('main');
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                    minRating === 0 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium text-sm">All Ratings</span>
                  {minRating === 0 && <Check className="w-4 h-4" />}
                </button>
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setMinRating?.(option.value);
                      setActiveSection('main');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                      minRating === option.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < option.stars
                                ? minRating === option.value
                                  ? 'fill-primary-foreground text-primary-foreground'
                                  : 'fill-accent text-accent'
                                : 'text-border'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-sm">& Up</span>
                    </div>
                    {minRating === option.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sort"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <DrawerHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveSection('main')} className="p-1 rounded-full hover:bg-muted">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <DrawerTitle className="font-display text-lg">Sort By</DrawerTitle>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setActiveSection('main');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                      sortBy === option.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <span className="font-medium text-sm">{option.label}</span>
                    {sortBy === option.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileFilterDrawer;
