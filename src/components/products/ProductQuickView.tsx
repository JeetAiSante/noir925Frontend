import { useState } from 'react';
import { X, Heart, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
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

  // Handle products that only have single image vs images array
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
        <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden bg-background">
          <DialogTitle className="sr-only">{product.name} Quick View</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 z-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative bg-muted/20 aspect-square">
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <Badge className="bg-primary text-primary-foreground">New</Badge>
                )}
                {discount > 0 && (
                  <Badge variant="destructive">-{discount}%</Badge>
                )}
              </div>

              {/* Image Actions */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/80 hover:bg-background"
                  onClick={() => setShowZoom(true)}
                >
                  <Maximize2 className="w-4 h-4 mr-2" /> Zoom
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/80 hover:bg-background"
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
                      className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                <h2 className="text-2xl font-display font-semibold mb-2">{product.name}</h2>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={i < Math.floor(product.rating) ? 'text-gold' : 'text-muted'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews} reviews)
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
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {product.description}
                </p>

                {/* Size Selection */}
                {product.category !== 'Anklets' && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Size</p>
                    <div className="flex gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-10 h-10 rounded-md border text-sm font-medium transition-all ${
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
                <div className="mb-6">
                  <p className="text-sm font-medium mb-2">Quantity</p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleWishlist}
                    className={isInWishlist(product.id) ? 'text-rose border-rose' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <Link 
                  to={`/product/${product.id}`}
                  onClick={() => onOpenChange(false)}
                  className="block"
                >
                  <Button variant="ghost" className="w-full">
                    View Full Details
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
