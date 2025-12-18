import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, Shield, RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/products';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  const shipping = cartTotal >= 2999 ? 0 : 149;
  const total = cartTotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl text-foreground mb-4">
              Your Cart is Empty
            </h1>
            <p className="font-body text-muted-foreground mb-8">
              Looks like you haven't added any silver treasures yet. 
              Explore our collection and find something special.
            </p>
            <Link to="/shop">
              <Button variant="luxury" size="lg">
                Start Shopping
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
          <span className="text-foreground">Shopping Cart</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-8">
          Shopping Cart
          <span className="text-muted-foreground font-body text-lg ml-2">
            ({cartCount} items)
          </span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 p-4 bg-card rounded-xl border border-border"
              >
                {/* Image */}
                <Link to={`/product/${item.id}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/product/${item.id}`}
                        className="font-display text-lg text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      {item.size && (
                        <p className="font-body text-sm text-muted-foreground">
                          Size: {item.size}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-body">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-display text-lg text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.originalPrice && (
                        <p className="font-body text-sm text-muted-foreground line-through">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-xl border border-border sticky top-24">
              <h2 className="font-display text-xl text-foreground mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between font-body">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between font-body">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    {shipping === 0 ? (
                      <span className="text-primary">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add {formatPrice(2999 - cartTotal)} more for free shipping
                  </p>
                )}
                <div className="border-t border-border pt-4 flex justify-between font-display text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  (Inclusive of all taxes)
                </p>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 border border-input rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>

              <Button variant="luxury" size="lg" className="w-full mb-4">
                Proceed to Checkout
              </Button>

              <Link to="/shop">
                <Button variant="ghost" size="sm" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-border">
                <div className="flex flex-col items-center text-center">
                  <Truck className="w-5 h-5 text-primary mb-1" />
                  <span className="font-body text-xs text-muted-foreground">Free Ship</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Shield className="w-5 h-5 text-primary mb-1" />
                  <span className="font-body text-xs text-muted-foreground">Secure</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <RotateCcw className="w-5 h-5 text-primary mb-1" />
                  <span className="font-body text-xs text-muted-foreground">7-Day Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
