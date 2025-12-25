import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

const MobileFooter = () => {
  const location = useLocation();
  const { cartCount, wishlistCount } = useCart();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Shop', href: '/shop' },
    { icon: ShoppingBag, label: 'Cart', href: '/cart', badge: cartCount },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', badge: wishlistCount },
    { icon: User, label: 'Account', href: '/account' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full group"
            >
              <div className="relative">
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -inset-2 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon
                  className={`w-5 h-5 relative z-10 transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                {item.badge ? (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center z-20">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileFooter;
