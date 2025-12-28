import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Crown, Filter, ChevronRight, ArrowRight, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { products } from '@/data/products';
import { useCurrency } from '@/context/CurrencyContext';
import { SEOHead } from '@/components/seo/SEOHead';
import { BreadcrumbSchema } from '@/components/seo/ProductSchema';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const occasions = ['Wedding', 'Engagement', 'Reception', 'Mehendi', 'Sangeet', 'Haldi'];
const jewelryTypes = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Anklets', 'Sets'];
const materials = ['925 Sterling Silver', 'Gold Plated Silver', 'Oxidized Silver', 'Rose Gold Plated'];

const BridalCollection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();
  
  // Filter states
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter bridal products (using wedding/bridal related keywords)
  const bridalProducts = useMemo(() => {
    let filtered = products.filter(p => 
      p.category.toLowerCase().includes('bridal') ||
      p.name.toLowerCase().includes('bridal') ||
      p.name.toLowerCase().includes('wedding') ||
      p.description?.toLowerCase().includes('bridal') ||
      p.description?.toLowerCase().includes('wedding') ||
      p.isBestseller ||
      p.isNew
    );

    // Apply price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Apply category filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p => 
        selectedTypes.some(type => p.category.toLowerCase().includes(type.toLowerCase()))
      );
    }

    // Apply material filter
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter(p => 
        selectedMaterials.some(mat => p.material?.toLowerCase().includes(mat.toLowerCase().split(' ')[0]))
      );
    }

    // Sort
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
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [selectedOccasions, selectedTypes, selectedMaterials, priceRange, sortBy]);

  const toggleFilter = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedOccasions([]);
    setSelectedTypes([]);
    setSelectedMaterials([]);
    setPriceRange([0, 50000]);
    setSortBy('featured');
  };

  const activeFiltersCount = selectedOccasions.length + selectedTypes.length + selectedMaterials.length + 
    (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0);

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: 'Bridal Collection', url: '/bridal-collection' }
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Occasion */}
      <div>
        <h4 className="font-display text-sm mb-3">Occasion</h4>
        <div className="flex flex-wrap gap-2">
          {occasions.map(occasion => (
            <Badge
              key={occasion}
              variant={selectedOccasions.includes(occasion) ? 'default' : 'outline'}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleFilter(occasion, selectedOccasions, setSelectedOccasions)}
            >
              {occasion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Jewelry Type */}
      <div>
        <h4 className="font-display text-sm mb-3">Jewelry Type</h4>
        <div className="flex flex-wrap gap-2">
          {jewelryTypes.map(type => (
            <Badge
              key={type}
              variant={selectedTypes.includes(type) ? 'default' : 'outline'}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <h4 className="font-display text-sm mb-3">Material</h4>
        <div className="flex flex-wrap gap-2">
          {materials.map(material => (
            <Badge
              key={material}
              variant={selectedMaterials.includes(material) ? 'default' : 'outline'}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleFilter(material, selectedMaterials, setSelectedMaterials)}
            >
              {material}
            </Badge>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-display text-sm mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            value={[priceRange[1]]}
            min={0}
            max={50000}
            step={500}
            onValueChange={(val) => setPriceRange([0, val[0]])}
            className="mb-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Bridal Jewellery Collection | Wedding Silver Jewellery | NOIR925"
        description="Explore our exquisite bridal silver jewellery collection. Find stunning wedding rings, necklaces, earrings & bridal sets in 925 sterling silver. Perfect for your special day."
        keywords="bridal silver jewellery, wedding jewellery, bridal rings, bridal necklace, wedding earrings, bridal sets, 925 silver bridal, engagement jewellery, mehendi jewellery"
        canonicalUrl="https://noir925.com/bridal-collection"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <Header />

      <main className="relative">
        {/* Parallax Hero */}
        <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1920&h=1080&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          
          <motion.div 
            className="relative h-full flex flex-col items-center justify-center text-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center mb-6"
            >
              <Crown className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </motion.div>
            
            <motion.span 
              className="font-accent text-sm tracking-[0.4em] text-primary uppercase mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Bridal Collection
            </motion.span>
            
            <motion.h1 
              className="font-display text-4xl md:text-6xl lg:text-7xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Begin Your
              <br />
              <span className="text-primary">Forever</span>
            </motion.h1>
            
            <motion.p 
              className="font-body text-muted-foreground max-w-xl text-sm md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Exquisite handcrafted silver jewellery for your most precious moments
            </motion.p>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-1">
              <div className="w-1.5 h-3 bg-primary rounded-full" />
            </div>
          </motion.div>
        </section>

        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Bridal Collection</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <p className="text-sm text-muted-foreground">
                    {bridalProducts.length} pieces found
                  </p>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Products */}
              {bridalProducts.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                >
                  {bridalProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-display text-xl mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
                  <Button onClick={clearAllFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl mb-4">Need Help Choosing?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Our bridal consultants can help you find the perfect pieces for your special day.
            </p>
            <Link to="/contact">
              <Button variant="luxury" size="lg" className="gap-2">
                Book a Consultation
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BridalCollection;
