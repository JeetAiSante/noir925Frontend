import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, WishlistItem } from '@/context/CartContext';
import { Product, formatPrice } from '@/data/products';
import ProductQuickView from './ProductQuickView';
import { ProductSkeleton } from '@/components/ui/product-skeleton';

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
      <div
        className={`group relative ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-cursor="product"
      >
        <Link to={`/product/${product.id}`} className="block">
          {/* Image Container - 2:2 aspect ratio */}
          <div className="relative overflow-hidden rounded-xl aspect-square bg-muted mb-4">
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

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isNew && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-body tracking-wide rounded-full">
                  NEW
                </span>
              )}
              {product.isBestseller && (
                <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-body tracking-wide rounded-full">
                  BESTSELLER
                </span>
              )}
              {product.discount && (
                <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-body tracking-wide rounded-full">
                  -{product.discount}%
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <button
              onClick={handleWishlistClick}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                inWishlist
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-background/80 backdrop-blur-sm text-foreground hover:bg-secondary hover:text-secondary-foreground'
              }`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Quick actions */}
            <div
              className={`absolute bottom-4 left-4 right-4 flex gap-2 transition-all duration-500 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Button
                variant="glass"
                size="sm"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Add to Cart</span>
              </Button>
              <Button 
                variant="glass" 
                size="icon" 
                className="shrink-0"
                onClick={handleQuickView}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            {/* Shimmer effect on hover */}
            {isHovered && (
              <div className="absolute inset-0 shimmer pointer-events-none" />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
              {product.category}
            </p>
            <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="font-body text-xs text-muted-foreground">
                ({product.reviews})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-semibold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-body text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      <ProductQuickView
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
};

export default ProductCard;
