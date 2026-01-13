import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import ProductQuickView from '@/components/products/ProductQuickView';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/data/products';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { useHomepageSections } from '@/hooks/useHomepageSections';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

const NewArrivalsGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { settings: layoutSettings } = useLayoutSettings();

  const { data: newProducts = [], isLoading } = useProducts({ new: true, limit: 8 });
  
  const { getSectionSettings } = useHomepageSections();
  const sectionSettings = getSectionSettings('new_arrivals');

  // Mobile carousel logic
  const itemsPerPage = 2;
  const totalPages = Math.ceil(newProducts.length / itemsPerPage);

  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(newPage);
    
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * newPage;
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [totalPages]);

  // Swipe gesture support for mobile carousel
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => goToPage(currentPage + 1),
    onSwipeRight: () => goToPage(currentPage - 1),
    threshold: 40,
  });

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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12">
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

        {/* Mobile Carousel View */}
        <div className="md:hidden relative">
          {/* Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg transition-all duration-300 ${
                  currentPage === 0 ? 'opacity-30' : 'opacity-100'
                }`}
                aria-label="Previous products"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg transition-all duration-300 ${
                  currentPage >= totalPages - 1 ? 'opacity-30' : 'opacity-100'
                }`}
                aria-label="Next products"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </>
          )}

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory"
            {...swipeHandlers}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <div 
                key={pageIndex} 
                className="flex-shrink-0 w-full grid grid-cols-2 gap-3 px-1 snap-center"
              >
                {newProducts
                  .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isLoading={isLoading}
                      className="h-full"
                    />
                  ))}
              </div>
            ))}
          </div>

          {/* Page Indicators */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToPage(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentPage 
                      ? 'w-6 h-1.5 bg-primary' 
                      : 'w-1.5 h-1.5 bg-muted-foreground/30'
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Grid View */}
        <style>{`
          .new-arrivals-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowMobile}, 1fr); }
          @media (min-width: 640px) {
            .new-arrivals-grid { grid-template-columns: repeat(${layoutSettings.productsPerRowTablet}, 1fr); }
          }
          @media (min-width: 1024px) {
            .new-arrivals-grid { grid-template-columns: repeat(${layoutSettings.productsPerRow}, 1fr); }
          }
        `}</style>
        <div ref={gridRef} className="hidden md:grid new-arrivals-grid gap-4 md:gap-8">
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
        <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="relative h-[250px] md:h-[400px] rounded-2xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&h=600&fit=crop"
              alt="New Collection"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
              <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-body rounded-full mb-2 md:mb-3">
                LIMITED EDITION
              </span>
              <h3 className="font-display text-xl md:text-3xl text-background mb-1 md:mb-2">
                Celestial Collection
              </h3>
              <p className="font-body text-sm text-background/80 mb-3 md:mb-4 max-w-sm hidden sm:block">
                Inspired by the cosmos, featuring star motifs and moon-shaped pendants
              </p>
              <Link to="/shop?collection=celestial">
                <Button variant="hero" size="sm">
                  Explore Collection
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-6">
            <div className="relative h-[120px] md:h-[190px] rounded-xl overflow-hidden group">
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
            <div className="relative h-[120px] md:h-[190px] rounded-xl overflow-hidden group">
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
            <div className="col-span-2 relative h-[120px] md:h-[190px] rounded-xl overflow-hidden group">
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
