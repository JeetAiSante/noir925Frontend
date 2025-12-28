import { useState } from 'react';
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/products';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import ProductImageZoom from './ProductImageZoom';

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductQuickView = ({ product, open, onOpenChange }: ProductQuickViewProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [showZoom, setShowZoom] = useState(false);
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const { formatPrice } = useCurrency();

  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : product?.image 
      ? [product.image] 
      : [];

  if (!product) return null;

  const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL'];
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: productImages[0] || product.image,
      size: selectedSize,
    }, quantity);
    onOpenChange(false);
  };

  const handleWishlist = () => {
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: productImages[0] || product.image,
      category: product.category,
    });
  };

  const nextImage = () => {
    if (productImages.length > 1) {
      setSelectedImage((prev) => (prev + 1) % productImages.length);
    }
  };

  const prevImage = () => {
    if (productImages.length > 1) {
      setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-3xl p-0 gap-0 overflow-hidden bg-background border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">{product.name} Quick View</DialogTitle>
          
          {/* Single Close Button - Top Right */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 z-20 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative bg-muted/30 aspect-square">
              <img 
                src={productImages[selectedImage] || product.image} 
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setShowZoom(true)}
                loading="lazy"
              />
              
              {/* Image Navigation */}
              {productImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-soft h-8 w-8"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-soft h-8 w-8"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.isNew && (
                  <Badge className="bg-primary text-primary-foreground shadow-soft text-xs">New</Badge>
                )}
                {discount > 0 && (
                  <Badge variant="destructive" className="shadow-soft text-xs">-{discount}%</Badge>
                )}
              </div>

              {/* Zoom Action */}
              <div className="absolute bottom-3 left-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/90 hover:bg-background shadow-soft h-8 text-xs"
                  onClick={() => setShowZoom(true)}
                >
                  <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Zoom
                </Button>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="absolute bottom-3 right-3 flex gap-1.5">
                  {productImages.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-all shadow-soft ${
                        selectedImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-background/80'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-4 md:p-6 flex flex-col max-h-[60vh] md:max-h-[80vh] overflow-y-auto">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{product.category}</p>
                <h2 className="text-xl md:text-2xl font-display font-semibold mb-2">{product.name}</h2>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-sm ${i < Math.floor(product.rating) ? 'text-accent' : 'text-muted'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {discount > 0 && (
                    <Badge variant="secondary" className="text-xs">Save {discount}%</Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                  {product.description}
                </p>

                {/* Material Info */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Material</p>
                    <p className="text-xs font-medium">{product.material}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Weight</p>
                    <p className="text-xs font-medium">{product.weight}</p>
                  </div>
                </div>

                {/* Size Selection */}
                {product.category !== 'Anklets' && sizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Select Size</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[40px] h-9 px-2.5 rounded-md border text-xs font-medium transition-all ${
                            selectedSize === size 
                              ? 'border-primary bg-primary text-primary-foreground shadow-soft' 
                              : 'border-border hover:border-primary hover:bg-primary/5'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Quantity</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-9 w-9"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="w-10 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-9 w-9"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-3 border-t border-border/50">
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 h-10" 
                    size="default"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleWishlist}
                    className={`h-10 w-10 ${isInWishlist(product.id) ? 'text-secondary border-secondary bg-secondary/10' : ''}`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <Link 
                  to={`/product/${product.id}`}
                  onClick={() => onOpenChange(false)}
                  className="block"
                >
                  <Button variant="ghost" className="w-full h-9 text-sm">
                    View Full Details →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProductImageZoom
        images={productImages}
        currentIndex={selectedImage}
        open={showZoom}
        onOpenChange={setShowZoom}
      />
    </>
  );
};

export default ProductQuickView;