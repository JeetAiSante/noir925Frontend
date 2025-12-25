import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Sparkles, TrendingUp, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, WishlistItem } from '@/context/CartContext';
import { Product, formatPrice } from '@/data/products';
import ProductQuickView from './ProductQuickView';
import { ProductSkeleton } from '@/components/ui/product-skeleton';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  className?: string;
  isLoading?: boolean;
}

// Alternate images for hover effect
const alternateImages: Record<string, string> = {
  'p1': 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop',
  'p2': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
  'p3': 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop',
  'p4': 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&h=600&fit=crop',
  'p5': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
  'p6': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop',
  'p7': 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=600&h=600&fit=crop',
  'p8': 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&h=600&fit=crop',
  'p9': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
  'p10': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
  'p11': 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=600&h=600&fit=crop',
  'p12': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
};

const ProductCard = ({ product, className = '', isLoading }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [altImageLoaded, setAltImageLoaded] = useState(false);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  const alternateImage = alternateImages[product.id] || product.image;

  if (isLoading) {
    return <ProductSkeleton className={className} />;
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    } else {
      addToWishlist(wishlistItem);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <>
      <motion.div
        className={`group relative bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-cursor="product"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Link to={`/product/${product.id}`} className="block">
          {/* Image Container - Compact aspect ratio */}
          <div className="relative overflow-hidden aspect-square bg-muted">
            {/* Skeleton loader while image loads */}
            {!imageLoaded && (
              <div className="absolute inset-0 shimmer-skeleton" />
            )}
            
            {/* Primary Image */}
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                isHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {/* Alternate Image (shown on hover) */}
            <img
              src={alternateImage}
              alt={`${product.name} - alternate view`}
              loading="lazy"
              decoding="async"
              onLoad={() => setAltImageLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
            />

            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

            {/* Compact Badges - Top Left */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
              {product.isNew && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  NEW
                </motion.span>
              )}
              {product.isBestseller && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md"
                >
                  <TrendingUp className="w-2.5 h-2.5" />
                  HOT
                </motion.span>
              )}
            </div>

            {/* Discount Badge - Top Right with prominent style */}
            {product.discount && (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-2 right-2 z-10"
              >
                <div className="relative">
                  <div className="bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground px-2.5 py-1 rounded-lg shadow-lg">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span className="text-sm font-bold">-{product.discount}%</span>
                    </div>
                  </div>
                  {/* Savings amount */}
                  {product.originalPrice && (
                    <div className="absolute -bottom-5 right-0 bg-background/90 backdrop-blur-sm text-[9px] font-medium px-1.5 py-0.5 rounded text-foreground whitespace-nowrap">
                      Save {formatPrice(product.originalPrice - product.price)}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Wishlist button */}
            <button
              onClick={handleWishlistClick}
              className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                inWishlist
                  ? 'bg-secondary text-secondary-foreground scale-100'
                  : `bg-background/80 backdrop-blur-sm text-foreground hover:bg-secondary hover:text-secondary-foreground ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Quick actions on hover */}
            <div
              className={`absolute bottom-2 left-2 right-12 flex gap-1.5 transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Button
                variant="glass"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                Add to Cart
              </Button>
              <Button 
                variant="glass" 
                size="icon" 
                className="shrink-0 h-8 w-8"
                onClick={handleQuickView}
                title="Quick View"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Subtle shimmer effect on hover */}
            {isHovered && (
              <div className="absolute inset-0 shimmer pointer-events-none opacity-50" />
            )}
          </div>

          {/* Product Info - Compact layout */}
          <div className="p-3 space-y-1.5">
            {/* Category */}
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">
              {product.category}
            </p>
            
            {/* Name */}
            <h3 className="font-display text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
              {product.name}
            </h3>

            {/* Rating - Compact */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="font-body text-[10px] text-muted-foreground">
                ({product.reviews})
              </span>
            </div>

            {/* Price - Enhanced styling */}
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-display text-base font-semibold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-body text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>

      <ProductQuickView
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
};

export default ProductCard;
