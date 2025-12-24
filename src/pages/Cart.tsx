import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, Shield, RotateCcw, Sparkles, Gift, CreditCard } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/products';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const shipping = cartTotal >= 2999 ? 0 : 149;
  const total = cartTotal + shipping - discount;

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'save10') {
      setDiscount(Math.round(cartTotal * 0.1));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse">
              <ShoppingBag className="w-14 h-14 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Your Cart is Empty
            </h1>
            <p className="font-body text-muted-foreground mb-8 leading-relaxed">
              Looks like you haven't added any silver treasures yet. 
              Explore our collection and find something special.
            </p>
            <Link to="/shop">
              <Button variant="luxury" size="lg" className="group">
                Start Shopping
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
          <span className="text-foreground font-medium">Shopping Cart</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-foreground">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground font-body text-sm mt-1">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link to="/shop" className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/20 hover:shadow-soft transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
                <Link to={`/product/${item.id}`} className="shrink-0">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 md:w-28 md:h-28 object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.id}`}
                        className="font-display text-base md:text-lg text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      {item.size && (
                        <p className="font-body text-xs text-muted-foreground mt-0.5">
                          Size: {item.size}
                        </p>
                      )}
                      <p className="font-body text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Shield className="w-3 h-3 text-primary" />
                        925 Sterling Silver
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center font-body text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-display text-base md:text-lg text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.originalPrice && (
                        <p className="font-body text-xs text-muted-foreground line-through">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Gift Wrap Option */}
            <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary rounded" />
                <Gift className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Add Gift Wrapping</p>
                  <p className="text-xs text-muted-foreground">Premium packaging for ₹99</p>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card p-5 rounded-xl border border-border sticky top-20">
              <h2 className="font-display text-lg text-foreground mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                  <span className="text-foreground font-medium">{formatPrice(cartTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-body text-sm text-primary">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    {shipping === 0 ? (
                      <span className="text-primary font-medium">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                    💡 Add {formatPrice(2999 - cartTotal)} more for free shipping
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-display text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  (Inclusive of all taxes)
                </p>
              </div>

              {/* Coupon */}
              <div className="mb-5">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 text-sm h-10"
                  />
                  <Button variant="outline" size="sm" onClick={applyCoupon} className="h-10">
                    Apply
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Try: SAVE10 for 10% off</p>
              </div>

              <Link to="/checkout">
                <Button variant="luxury" size="lg" className="w-full mb-3 group">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                <div className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Truck className="w-4 h-4 text-primary mb-1" />
                  <span className="font-body text-[10px] text-muted-foreground leading-tight">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Shield className="w-4 h-4 text-primary mb-1" />
                  <span className="font-body text-[10px] text-muted-foreground leading-tight">100% Secure</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <RotateCcw className="w-4 h-4 text-primary mb-1" />
                  <span className="font-body text-[10px] text-muted-foreground leading-tight">Easy Returns</span>
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