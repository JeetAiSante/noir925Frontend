import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import ProductQuickView from '@/components/products/ProductQuickView';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/data/products';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { useHomepageSections } from '@/hooks/useHomepageSections';

const NewArrivalsGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const { settings: layoutSettings } = useLayoutSettings();

  const { data: newProducts = [], isLoading } = useProducts({ new: true, limit: 6 });
  
  // Get section settings for custom title/subtitle
  const { getSectionSettings } = useHomepageSections();
  const sectionSettings = getSectionSettings('new_arrivals');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' }
    );

    const items = gridRef.current?.querySelectorAll('[data-index]');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [newProducts]);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  return (
    <section className="py-12 md:py-16 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-muted/50 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <p className="font-accent text-sm text-primary tracking-widest uppercase">
                {sectionSettings?.customSubtitle || 'Just Landed'}
              </p>
            </div>
            <h2 className="font-display text-3xl md:text-5xl text-foreground">
              {sectionSettings?.customTitle || 'New Arrivals'}
            </h2>
          </div>
          <Link to="/shop?filter=new" className="mt-4 md:mt-0">
            <Button variant="ghost" className="group">
              View All New
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Products Grid with Stagger Animation */}
        {/* Products Grid with dynamic layout */}
        <style>{`
          .new-arrivals-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowMobile}, 1fr); }
          @media (min-width: 640px) {
            .new-arrivals-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowTablet}, 1fr); }
          }
          @media (min-width: 1024px) {
            .new-arrivals-grid { grid-template-columns: repeat(${layoutSettings.productsPerRow}, 1fr); }
          }
        `}</style>
        <div ref={gridRef} className="new-arrivals-grid grid gap-4 md:gap-8">
          {newProducts.map((product, index) => (
            <div
              key={product.id}
              data-index={index}
              className={`transition-all duration-700 ${
                visibleItems.has(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <ProductCard
                product={product}
                isLoading={isLoading}
                className="h-full"
              />
            </div>
          ))}
        </div>

        {/* Featured New Arrival Banner */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&h=600&fit=crop"
              alt="New Collection"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-body rounded-full mb-3">
                LIMITED EDITION
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-background mb-2">
                Celestial Collection
              </h3>
              <p className="font-body text-background/80 mb-4 max-w-sm">
                Inspired by the cosmos, featuring star motifs and moon-shaped pendants
              </p>
              <Link to="/shop?collection=celestial">
                <Button variant="hero" size="sm">
                  Explore Collection
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="relative h-[140px] md:h-[190px] rounded-xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop"
                alt="Rings"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Link to="/shop?category=rings">
                  <Button variant="hero-outline" size="sm">
                    New Rings
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[140px] md:h-[190px] rounded-xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&h=300&fit=crop"
                alt="Earrings"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Link to="/shop?category=earrings">
                  <Button variant="hero-outline" size="sm">
                    New Earrings
                  </Button>
                </Link>
              </div>
            </div>
            <div className="col-span-2 relative h-[140px] md:h-[190px] rounded-xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=300&fit=crop"
                alt="Necklaces"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Link to="/shop?category=necklaces">
                  <Button variant="hero-outline" size="sm">
                    New Necklaces
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductQuickView
        product={selectedProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </section>
  );
};

export default NewArrivalsGrid;
