import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { categories } from '@/data/products';
import SearchModal from '@/components/search/SearchModal';
import LocationDropdown from '@/components/header/LocationDropdown';

const INSTAGRAM_URL = 'https://www.instagram.com/noir925_official?igsh=bGZkcHR6eTV6cG4x';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, wishlistCount } = useCart();
  const location = useLocation();

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

  const navLinks = [
    { name: 'Shop', href: '/shop', hasMegaMenu: true },
    { name: 'Collections', href: '/collections' },
    { name: 'Silver Care', href: '/silver-care' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
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
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
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
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <span className="font-display text-xl md:text-2xl lg:text-3xl font-semibold tracking-wider">
                  NOIR<span className="text-primary">925</span>
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.hasMegaMenu && setIsMegaMenuOpen(true)}
                  onMouseLeave={() => link.hasMegaMenu && setIsMegaMenuOpen(false)}
                >
                  <Link
                    to={link.href}
                    className="flex items-center gap-1 font-body text-sm uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors py-2"
                  >
                    {link.name}
                    {link.hasMegaMenu && <ChevronDown className="w-4 h-4" />}
                  </Link>

                  {/* Mega Menu */}
                  {link.hasMegaMenu && isMegaMenuOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-screen max-w-4xl bg-card/98 backdrop-blur-2xl border border-border/50 shadow-luxury rounded-lg mt-2 p-6 animate-fade-in">
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
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Location Dropdown - Desktop */}
              <div className="hidden md:block">
                <LocationDropdown />
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex"
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

              <Link to="/account" className="hidden md:block">
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="w-5 h-5" />
                </Button>
              </Link>

              {/* Mobile Search */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-background border-t border-border animate-fade-in">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {/* Mobile Location */}
              <div className="py-3 border-b border-border/50">
                <LocationDropdown />
              </div>
              
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block font-body text-base py-3 border-b border-border/50 hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                to="/account" 
                className="flex items-center gap-2 py-3 text-muted-foreground hover:text-primary transition-colors"
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
