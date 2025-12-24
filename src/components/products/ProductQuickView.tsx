import { useState } from 'react';
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, formatPrice } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import ProductImageZoom from './ProductImageZoom';
import Product360View from './Product360View';

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
  const [show360, setShow360] = useState(false);
  const { addToCart, addToWishlist, isInWishlist } = useCart();

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
        <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden bg-background border-border/50">
          <DialogTitle className="sr-only">{product.name} Quick View</DialogTitle>
          
          {/* Single Close Button - Top Right */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-20 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative bg-muted/30 aspect-square">
              <img 
                src={productImages[selectedImage] || product.image} 
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setShowZoom(true)}
              />
              
              {/* Image Navigation */}
              {productImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-soft"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-soft"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <Badge className="bg-primary text-primary-foreground shadow-soft">New</Badge>
                )}
                {discount > 0 && (
                  <Badge variant="destructive" className="shadow-soft">-{discount}%</Badge>
                )}
              </div>

              {/* Image Actions */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/90 hover:bg-background shadow-soft"
                  onClick={() => setShowZoom(true)}
                >
                  <Maximize2 className="w-4 h-4 mr-2" /> Zoom
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/90 hover:bg-background shadow-soft"
                  onClick={() => setShow360(true)}
                >
                  360° View
                </Button>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {productImages.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shadow-soft ${
                        selectedImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-background/80'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 flex flex-col max-h-[80vh] overflow-y-auto">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-2">{product.category}</p>
                <h2 className="text-2xl md:text-3xl font-display font-semibold mb-3">{product.name}</h2>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-lg ${i < Math.floor(product.rating) ? 'text-accent' : 'text-muted'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {discount > 0 && (
                    <Badge variant="secondary" className="text-xs">Save {discount}%</Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Material Info */}
                <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Material</p>
                    <p className="text-sm font-medium">{product.material}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Weight</p>
                    <p className="text-sm font-medium">{product.weight}</p>
                  </div>
                </div>

                {/* Size Selection */}
                {product.category !== 'Anklets' && sizes.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-3">Select Size</p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[44px] h-11 px-3 rounded-lg border text-sm font-medium transition-all ${
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
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Quantity</p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-11 w-11"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-11 w-11"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 h-12" 
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" /> Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleWishlist}
                    className={`h-12 w-12 ${isInWishlist(product.id) ? 'text-secondary border-secondary bg-secondary/10' : ''}`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <Link 
                  to={`/product/${product.id}`}
                  onClick={() => onOpenChange(false)}
                  className="block"
                >
                  <Button variant="ghost" className="w-full h-11">
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

      <Product360View
        images={productImages}
        open={show360}
        onOpenChange={setShow360}
      />
    </>
  );
};

export default ProductQuickView;
