import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, Shield, RotateCcw, Star, Minus, Plus, ChevronRight, Share2, Ruler, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileFooter from '@/components/layout/MobileFooter';
import { Button } from '@/components/ui/button';
import { useCart, WishlistItem } from '@/context/CartContext';
import { products } from '@/data/products';
import { useCurrency } from '@/context/CurrencyContext';
import ProductCard from '@/components/products/ProductCard';
import ProductImageZoom from '@/components/products/ProductImageZoom';
import SwipeableGallery from '@/components/products/SwipeableGallery';
import FloatingSpinWheel from '@/components/shop/FloatingSpinWheel';
import { toast } from 'sonner';
import { SEOHead } from '@/components/seo/SEOHead';
import { ProductSchema, BreadcrumbSchema } from '@/components/seo/ProductSchema';

const ProductPage = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showZoom, setShowZoom] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { formatPrice } = useCurrency();

  const product = products.find((p) => p.id === id);
  
  // Stock status
  const stockQuantity = product?.stockQuantity ?? 10;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;
  const isOutOfStock = stockQuantity === 0;

  useEffect(() => {
    if (product) {
      const stored = localStorage.getItem('noir925_recently_viewed');
      const viewed: string[] = stored ? JSON.parse(stored) : [];
      const updated = [product.id, ...viewed.filter((i) => i !== product.id)].slice(0, 10);
      localStorage.setItem('noir925_recently_viewed', JSON.stringify(updated));
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-4xl mb-4">Product Not Found</h1>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images || [product.image, product.image, product.image];
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 8);

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: product.category, url: `/shop?category=${product.category.toLowerCase()}` },
    { name: product.name, url: `/product/${product.id}` }
  ];

  const seoDescription = `Buy ${product.name} - ${product.description?.slice(0, 120) || 'Premium 925 sterling silver jewellery'}. ₹${product.price.toLocaleString()}. Free shipping, BIS Hallmark certified. Shop now at NOIR925.`;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    if (quantity > stockQuantity) {
      toast.error(`Only ${stockQuantity} items available`);
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        size: selectedSize,
      },
      quantity
    );
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistClick = () => {
    const wishlistItem: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(wishlistItem);
      toast.success('Added to wishlist');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead 
        title={product.name}
        description={seoDescription}
        keywords={`${product.name}, 925 sterling silver ${product.category}, ${product.category} for women, silver ${product.category} online India, ${product.material || 'sterling silver'} jewellery`}
        canonicalUrl={`https://noir925.com/product/${product.id}`}
        ogImage={product.image}
        ogType="product"
        product={{
          name: product.name,
          price: product.price,
          image: product.image,
          sku: product.id,
          availability: isOutOfStock ? 'OutOfStock' : 'InStock',
          rating: product.rating,
          reviewCount: product.reviews
        }}
      />
      <ProductSchema product={product} />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 mb-12 md:mb-24">
          {/* Images - Swipeable Gallery */}
          <SwipeableGallery
            images={images}
            alt={product.name}
            discount={product.discount}
            onZoomClick={() => setShowZoom(true)}
          />

          {/* Details */}
          <div className="space-y-4 md:space-y-6">
            {/* Category & Actions */}
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-primary uppercase tracking-widest font-medium">
                {product.category}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={inWishlist ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={handleWishlistClick}
                  className="rounded-full"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 md:w-5 md:h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg md:text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-sm md:text-base text-secondary font-medium">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 py-4 md:py-6 border-y border-border">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-1">Material</p>
                <p className="font-medium text-sm md:text-base">{product.material}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-1">Weight</p>
                <p className="font-medium text-sm md:text-base">{product.weight}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-1">Purity</p>
                <p className="font-medium text-sm md:text-base">{product.purity}</p>
              </div>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-sm md:text-base">Select Size</p>
                  <Link to="/size-guide" className="text-primary text-xs md:text-sm flex items-center gap-1 hover:underline">
                    <Ruler className="w-4 h-4" />
                    Size Guide
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-10 md:min-w-[48px] md:h-12 px-3 md:px-4 rounded-xl border text-sm md:text-base font-medium transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="font-medium text-sm md:text-base mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 md:p-3 hover:bg-muted transition-colors"
                    disabled={isOutOfStock}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 md:w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                    className="p-2.5 md:p-3 hover:bg-muted transition-colors"
                    disabled={isOutOfStock || quantity >= stockQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {isOutOfStock ? (
                  <span className="text-sm font-medium text-destructive">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-sm font-medium text-secondary animate-pulse">Only {stockQuantity} left!</span>
                ) : (
                  <span className="text-sm text-muted-foreground">In Stock</span>
                )}
              </div>
            </div>

            {/* Actions - Mobile Optimized */}
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant={isOutOfStock ? "secondary" : "luxury"}
                size="lg"
                className="flex-1 h-11 sm:h-12 md:h-14 text-sm sm:text-base px-3 sm:px-4"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 sm:h-12 md:h-14 w-11 sm:w-12 md:w-14 p-0 shrink-0"
                onClick={handleWishlistClick}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 pt-4 md:pt-6 border-t border-border">
              <div className="flex flex-col items-center text-center p-2 md:p-3 rounded-xl bg-muted/30">
                <Truck className="w-5 h-5 md:w-6 md:h-6 text-primary mb-1" />
                <span className="text-[10px] md:text-xs text-muted-foreground">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 md:p-3 rounded-xl bg-muted/30">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary mb-1" />
                <span className="text-[10px] md:text-xs text-muted-foreground">BIS Hallmarked</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 md:p-3 rounded-xl bg-muted/30">
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-primary mb-1" />
                <span className="text-[10px] md:text-xs text-muted-foreground">7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products - You May Also Like */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="font-display text-xl md:text-2xl">You May Also Like</h2>
              <Link 
                to={`/shop?category=${product.category.toLowerCase()}`} 
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                View More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <FloatingSpinWheel />
      <Footer />
      <MobileFooter />

      {/* Zoom Modal */}
      <ProductImageZoom
        images={images}
        currentIndex={activeImage}
        open={showZoom}
        onOpenChange={setShowZoom}
      />
    </div>
  );
};

export default ProductPage;
