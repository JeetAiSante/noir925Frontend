import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, Gem, Crown, Sparkles, Gift, Star, Diamond, CircleDot, Flower2, Watch, Anchor, Moon, Sun, Zap, Hexagon, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import SearchModal from '@/components/search/SearchModal';
import LocationDropdown from '@/components/header/LocationDropdown';
import CurrencySelector from '@/components/header/CurrencySelector';
import { useHeaderCategories } from '@/hooks/useHeaderCategories';
import { useFeatureToggles } from '@/hooks/useFeatureToggles';

// Extended icon map with jewelry-related icons
const iconMap: Record<string, React.ReactNode> = {
  gem: <Gem className="w-4 h-4" />,
  crown: <Crown className="w-4 h-4" />,
  sparkles: <Sparkles className="w-4 h-4" />,
  gift: <Gift className="w-4 h-4" />,
  heart: <Heart className="w-4 h-4 fill-current" />,
  star: <Star className="w-4 h-4" />,
  diamond: <Diamond className="w-4 h-4" />,
  ring: <CircleDot className="w-4 h-4" />,
  flower: <Flower2 className="w-4 h-4" />,
  watch: <Watch className="w-4 h-4" />,
  anchor: <Anchor className="w-4 h-4" />,
  moon: <Moon className="w-4 h-4" />,
  sun: <Sun className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  hexagon: <Hexagon className="w-4 h-4" />,
  circle: <Circle className="w-4 h-4" />,
};

// Default categories when DB is empty
const defaultCategories = [
  { name: 'All Jewellery', slug: 'all', header_icon: 'gem' },
  { name: 'Rings', slug: 'rings', header_icon: 'ring' },
  { name: 'Earrings', slug: 'earrings', header_icon: 'sparkles' },
  { name: 'Necklaces', slug: 'necklaces', header_icon: 'diamond' },
  { name: 'Bracelets', slug: 'bracelets', header_icon: 'circle' },
  { name: 'Collections', slug: 'collections', header_icon: 'crown' },
];

const HeaderDynamic = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, wishlistCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const { categories: dbCategories, loading: categoriesLoading } = useHeaderCategories();
  const { isEnabled } = useFeatureToggles();

  const showLocationDropdown = isEnabled('location_dropdown');
  const showHeaderCategories = isEnabled('header_categories');

  // Use DB categories or fallback to defaults
  const categories = dbCategories.length > 0 ? dbCategories : defaultCategories.map((c, i) => ({ ...c, id: `default-${i}`, header_sort_order: i }));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getCategoryHref = (slug: string) => {
    if (slug === 'all') return '/shop';
    if (slug === 'collections') return '/collections';
    return `/shop?category=${slug}`;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled ? 'bg-background/95 backdrop-blur-xl shadow-medium' : 'bg-background'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16 gap-4">
            {/* Mobile Menu */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <span className="font-display text-xl md:text-2xl lg:text-3xl font-semibold tracking-wider">
                NOIR<span className="text-primary">925</span>
              </span>
            </Link>

            {/* Search - Desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for silver jewellery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 h-11 rounded-full border-2 border-border/50 bg-muted/30 focus:border-primary/50"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <div className="hidden lg:block">
                <CurrencySelector />
              </div>

              {showLocationDropdown && (
                <div className="hidden lg:block">
                  <LocationDropdown />
                </div>
              )}

              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSearchOpen(true)}>
                <Search className="w-5 h-5" />
              </Button>

              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link to="/account" className="hidden md:block">
                <Button variant="ghost" size="icon"><User className="w-5 h-5" /></Button>
              </Link>

              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Category Navigation - Desktop */}
        {showHeaderCategories && (
          <div className="hidden lg:block border-t border-border/50">
            <div className="container mx-auto px-4">
              <nav className="flex items-center justify-center gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id || cat.slug}
                    to={getCategoryHref(cat.slug)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-body text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors rounded-lg"
                  >
                    <span className="text-primary/70">{iconMap[cat.header_icon || 'gem']}</span>
                    {cat.name}
                  </Link>
                ))}
                <Link
                  to="/gifting"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-body text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors rounded-lg"
                >
                  <span className="text-primary/70"><Gift className="w-4 h-4" /></span>
                  Gifting
                </Link>
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-background border-t border-border animate-fade-in">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <CurrencySelector />
                {showLocationDropdown && <LocationDropdown />}
              </div>

              <form onSubmit={handleSearch} className="py-3 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search jewellery..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4"
                  />
                </div>
              </form>

              {showHeaderCategories && categories.map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  to={getCategoryHref(cat.slug)}
                  className="flex items-center gap-3 font-body text-base py-3 border-b border-border/50 hover:text-primary transition-colors"
                >
                  <span className="text-primary/70">{iconMap[cat.header_icon || 'gem']}</span>
                  {cat.name}
                </Link>
              ))}

              <Link to="/account" className="flex items-center gap-3 py-3 text-muted-foreground hover:text-primary transition-colors">
                <User className="w-5 h-5" />
                My Account
              </Link>
            </nav>
          </div>
        )}
      </header>

      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default HeaderDynamic;
