import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Share2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/products';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, moveToCart, wishlistCount } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 flex items-center justify-center">
              <Heart className="w-14 h-14 text-rose-500" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="font-body text-muted-foreground mb-8 leading-relaxed">
              Save your favorite pieces here and come back to them anytime. 
              Start exploring our collections.
            </p>
            <Link to="/shop">
              <Button variant="luxury" size="lg" className="group">
                Discover Silver
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Wishlist</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-foreground flex items-center gap-2">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
              My Wishlist
            </h1>
            <p className="font-body text-muted-foreground text-sm mt-1">
              {wishlistCount} saved {wishlistCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 w-fit">
            <Share2 className="w-4 h-4" />
            Share Wishlist
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative bg-card rounded-xl border border-border overflow-hidden hover:border-primary/20 hover:shadow-medium transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Image */}
              <Link to={`/product/${item.id}`} className="block">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>

              {/* Remove button */}
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 shadow-sm"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Discount Badge */}
              {item.originalPrice && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                </div>
              )}

              {/* Info */}
              <div className="p-3 md:p-4">
                <p className="font-body text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {item.category}
                </p>
                <Link
                  to={`/product/${item.id}`}
                  className="font-display text-sm md:text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                <div className="flex items-center gap-2 mt-2 mb-3">
                  <span className="font-display font-semibold text-foreground text-sm md:text-base">
                    {formatPrice(item.price)}
                  </span>
                  {item.originalPrice && (
                    <span className="font-body text-xs text-muted-foreground line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                <Button
                  variant="luxury"
                  size="sm"
                  className="w-full text-xs md:text-sm group/btn"
                  onClick={() => moveToCart(item)}
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                  Move to Cart
                  <Sparkles className="w-3 h-3 ml-1.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-10">
          <Link to="/shop">
            <Button variant="outline" size="lg" className="group">
              Continue Shopping
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;