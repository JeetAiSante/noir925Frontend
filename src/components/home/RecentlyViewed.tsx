import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';

const RecentlyViewed = () => {
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('noir925_recently_viewed');
    if (stored) {
      setViewedIds(JSON.parse(stored));
    }
  }, []);

  const viewedProducts = products.filter((p) => viewedIds.includes(p.id)).slice(0, 4);

  if (viewedProducts.length === 0 || !isVisible) return null;

  return (
    <section className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-accent text-xs text-muted-foreground tracking-widest uppercase mb-1">
              Continue Exploring
            </p>
            <h3 className="font-display text-xl text-foreground">
              Recently Viewed
            </h3>
          </div>
          <button
            onClick={() => {
              // Clear from local storage and hide section
              localStorage.removeItem('noir925_recently_viewed');
              setViewedIds([]);
              setIsVisible(false);
            }}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Clear recently viewed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {viewedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
