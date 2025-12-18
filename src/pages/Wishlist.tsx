import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
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
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl text-foreground mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="font-body text-muted-foreground mb-8">
              Save your favorite pieces here and come back to them anytime. 
              Start exploring our collections.
            </p>
            <Link to="/shop">
              <Button variant="luxury" size="lg">
                Discover Silver
                <ArrowRight className="w-5 h-5 ml-2" />
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

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">Wishlist</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              My Wishlist
            </h1>
            <p className="font-body text-muted-foreground mt-1">
              {wishlistCount} saved {wishlistCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-card rounded-xl border border-border overflow-hidden"
            >
              {/* Image */}
              <Link to={`/product/${item.id}`} className="block">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>

              {/* Remove button */}
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Info */}
              <div className="p-4">
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {item.category}
                </p>
                <Link
                  to={`/product/${item.id}`}
                  className="font-display text-foreground hover:text-primary transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                <div className="flex items-center gap-2 mt-2 mb-4">
                  <span className="font-display font-semibold text-foreground">
                    {formatPrice(item.price)}
                  </span>
                  {item.originalPrice && (
                    <span className="font-body text-sm text-muted-foreground line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                <Button
                  variant="luxury"
                  size="sm"
                  className="w-full"
                  onClick={() => moveToCart(item)}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Move to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link to="/shop">
            <Button variant="outline" size="lg">
              Continue Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
