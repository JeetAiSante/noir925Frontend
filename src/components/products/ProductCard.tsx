import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Sparkles, TrendingUp, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, WishlistItem } from '@/context/CartContext';
import { Product } from '@/data/products';
import { useCurrency } from '@/context/CurrencyContext';
import ProductQuickView from './ProductQuickView';
import { ProductSkeleton } from '@/components/ui/product-skeleton';
import { motion } from 'framer-motion';
import OptimizedImage from '@/components/ui/optimized-image';

interface ProductCardProps {
  product: Product;
  className?: string;
  isLoading?: boolean;
}

const ProductCard = ({ product, className = '', isLoading }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { formatPrice } = useCurrency();

  // Use hoverImage from product if available, otherwise fallback to main image
  const hoverImage = (product as any).hoverImage || product.image;

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
      <motion.article
        className={`group relative bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-cursor="product"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        itemScope
        itemType="https://schema.org/Product"
      >
        <Link to={`/product/${product.id}`} className="block" aria-label={`View ${product.name} - ${formatPrice(product.price)}`}>
          {/* Image Container - Compact aspect ratio */}
          <div className="relative overflow-hidden aspect-square bg-muted">
            {/* Primary Image with OptimizedImage */}
            <OptimizedImage
              src={product.image}
              alt={`${product.name} - ${product.category} in 925 Sterling Silver | NOIR925`}
              aspectRatio="square"
              priority={false}
              blurPlaceholder={true}
              className={`absolute inset-0 transition-all duration-700 ${
                isHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
              }`}
            />
            
            {/* Hover Image (shown on hover - selected in admin) */}
            <OptimizedImage
              src={hoverImage}
              alt={`${product.name} - alternate view showing different angle`}
              aspectRatio="square"
              priority={false}
              blurPlaceholder={false}
              className={`absolute inset-0 transition-all duration-700 ${
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

            {/* Wishlist button - responsive sizing */}
            <button
              onClick={handleWishlistClick}
              className={`absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
                inWishlist
                  ? 'bg-secondary text-secondary-foreground scale-100'
                  : `bg-background/90 backdrop-blur-sm text-foreground hover:bg-secondary hover:text-secondary-foreground ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`
              }`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Quick actions on hover - responsive layout */}
            <div
              className={`absolute bottom-2 left-2 right-10 sm:right-12 flex gap-1 sm:gap-1.5 transition-all duration-300 z-10 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Button
                variant="glass"
                size="sm"
                className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 min-w-0"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="ml-1 truncate hidden xs:inline">Add to Cart</span>
                <span className="ml-1 xs:hidden">Add</span>
              </Button>
              <Button 
                variant="glass" 
                size="icon" 
                className="shrink-0 h-7 w-7 sm:h-8 sm:w-8"
                onClick={handleQuickView}
                title="Quick View"
              >
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Button>
            </div>

            {/* Subtle shimmer effect on hover */}
            {isHovered && (
              <div className="absolute inset-0 shimmer pointer-events-none opacity-50" />
            )}
          </div>

          {/* Product Info - Compact layout with microdata */}
          <div className="p-3 space-y-1.5">
            {/* Category */}
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">
              <span itemProp="category">{product.category}</span>
            </p>
            
            {/* Name */}
            <h3 className="font-display text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight" itemProp="name">
              {product.name}
            </h3>

            {/* Rating - Compact with microdata */}
            <div className="flex items-center gap-1.5" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <meta itemProp="ratingValue" content={product.rating.toString()} />
              <meta itemProp="reviewCount" content={product.reviews.toString()} />
              <meta itemProp="bestRating" content="5" />
              <div className="flex items-center gap-0.5" aria-label={`Rating: ${product.rating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-border'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="font-body text-[10px] text-muted-foreground">
                ({product.reviews})
              </span>
            </div>

            {/* Price - Enhanced styling with microdata */}
            <div className="flex items-baseline gap-2 pt-1" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <meta itemProp="priceCurrency" content="INR" />
              <meta itemProp="availability" content="https://schema.org/InStock" />
              <span className="font-display text-base font-semibold text-foreground" itemProp="price" content={product.price.toString()}>
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
      </motion.article>

      <ProductQuickView
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
};

export default ProductCard;
