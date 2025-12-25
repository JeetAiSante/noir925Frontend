import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Camera, MapPin, Gem, Crown, Sparkles, Gift, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { categories } from '@/data/products';
import SearchModal from '@/components/search/SearchModal';
import LocationDropdown from '@/components/header/LocationDropdown';

const INSTAGRAM_URL = 'https://www.instagram.com/noir925_official?igsh=bGZkcHR6eTV6cG4x';

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'All Jewellery': <Gem className="w-4 h-4" />,
  'Rings': <Crown className="w-4 h-4" />,
  'Earrings': <Sparkles className="w-4 h-4" />,
  'Necklaces': <Gem className="w-4 h-4" />,
  'Bracelets': <Gift className="w-4 h-4" />,
  'Pendants': <Crown className="w-4 h-4" />,
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, wishlistCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const categoryNav = [
    { name: 'All Jewellery', href: '/shop', icon: <Gem className="w-4 h-4" /> },
    { name: 'Rings', href: '/shop?category=rings', icon: <Crown className="w-4 h-4" /> },
    { name: 'Earrings', href: '/shop?category=earrings', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Necklaces', href: '/shop?category=necklaces', icon: <Gem className="w-4 h-4" /> },
    { name: 'Bracelets', href: '/shop?category=bracelets', icon: <Gift className="w-4 h-4" /> },
    { name: 'Collections', href: '/collections', icon: <Crown className="w-4 h-4" /> },
    { name: 'Wedding', href: '/collections/bridal-heritage', icon: <Heart className="w-4 h-4 fill-current" /> },
    { name: 'Gifting', href: '/shop?tag=gifting', icon: <Gift className="w-4 h-4" /> },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <>
      {/* Announcement Bar - Only on Home */}
      {isHomePage && (
        <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-body tracking-wide">
          <p>Free Shipping on Orders Above ₹2,999 | Hallmarked 925 Silver</p>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-medium'
            : 'bg-background'
        }`}
      >
        {/* Top Row - Logo, Search, Actions */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="relative">
                <span className="font-display text-xl md:text-2xl lg:text-3xl font-semibold tracking-wider">
                  NOIR<span className="text-primary">925</span>
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500" />
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <form 
              onSubmit={handleSearch}
              className="hidden lg:flex flex-1 max-w-xl mx-8"
            >
              <div className="relative w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for silver jewellery, rings, earrings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-14 h-11 rounded-full border-2 border-border/50 bg-muted/30 focus:border-primary/50 focus:bg-background transition-all"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted transition-colors"
                  aria-label="Visual search"
                >
                  <Camera className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Location - Desktop */}
              <div className="hidden lg:block">
                <LocationDropdown />
              </div>

              {/* Search - Mobile */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </Button>
              
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-secondary text-secondary-foreground text-[10px] md:text-xs rounded-full flex items-center justify-center font-medium">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link to="/account" className="hidden md:block">
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="w-5 h-5" />
                </Button>
              </Link>

              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-primary text-primary-foreground text-[10px] md:text-xs rounded-full flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Category Navigation - Desktop */}
        <div className="hidden lg:block border-t border-border/50">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-center gap-1">
              {categoryNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-body text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors rounded-lg"
                >
                  <span className="text-primary/70">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              <button
                className="flex items-center gap-2 px-4 py-3 text-sm font-body text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors rounded-lg"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </nav>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {isMegaMenuOpen && (
          <div className="hidden lg:block absolute top-full left-0 right-0 bg-card/98 backdrop-blur-2xl border-b border-border/50 shadow-luxury animate-fade-in">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-4 gap-6">
                {/* Categories */}
                <div className="col-span-2">
                  <h3 className="font-display text-lg mb-3 text-foreground">Shop by Category</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 8).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                        onClick={() => setIsMegaMenuOpen(false)}
                      >
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div>
                          <span className="font-body text-sm">{cat.name}</span>
                          <p className="text-xs text-muted-foreground">{cat.count} items</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Featured */}
                <div className="col-span-2">
                  <h3 className="font-display text-lg mb-3 text-foreground">Featured</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/collections/bridal-heritage"
                      className="relative overflow-hidden rounded-lg aspect-[4/3] group"
                      onClick={() => setIsMegaMenuOpen(false)}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=300&fit=crop"
                        alt="Bridal Collection"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent flex items-end p-3">
                        <span className="text-background font-display text-sm">Bridal Heritage</span>
                      </div>
                    </Link>
                    <Link
                      to="/shop?tag=new"
                      className="relative overflow-hidden rounded-lg aspect-[4/3] group"
                      onClick={() => setIsMegaMenuOpen(false)}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop"
                        alt="New Arrivals"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent flex items-end p-3">
                        <span className="text-background font-display text-sm">New Arrivals</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-background border-t border-border animate-fade-in">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {/* Mobile Location */}
              <div className="py-3 border-b border-border/50">
                <LocationDropdown />
              </div>

              {/* Mobile Search */}
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
              
              {categoryNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 font-body text-base py-3 border-b border-border/50 hover:text-primary transition-colors"
                >
                  <span className="text-primary/70">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              <Link 
                to="/account" 
                className="flex items-center gap-3 py-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <User className="w-5 h-5" />
                My Account
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default Header;
