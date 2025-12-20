import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, WishlistItem } from '@/context/CartContext';
import { Product, formatPrice } from '@/data/products';
import ProductQuickView from './ProductQuickView';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className = '' }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

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
          {/* Image Container */}
          <div className="relative overflow-hidden rounded-xl aspect-square bg-muted mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
