import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SwipeableGalleryProps {
  images: string[];
  alt: string;
  discount?: number;
  onZoomClick?: () => void;
  className?: string;
}

const SwipeableGallery = ({ 
  images, 
  alt, 
  discount,
  onZoomClick,
  className 
}: SwipeableGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  // Lowered threshold for better mobile touch response
  const swipeConfidenceThreshold = 5000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveIndex((prev) => {
      const newIndex = prev + newDirection;
      if (newIndex < 0) return images.length - 1;
      if (newIndex >= images.length) return 0;
      return newIndex;
    });
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    } else if (Math.abs(offset.x) > 50) {
      // Fallback: if dragged more than 50px, change slide
      if (offset.x < 0) {
        paginate(1);
      } else {
        paginate(-1);
      }
    }
  };

  const goToSlide = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'ArrowRight') {
        paginate(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (images.length === 0) return null;

  return (
    <div className={cn("space-y-3 md:space-y-4", className)}>
      {/* Main Image */}
      <div 
        ref={containerRef}
        className="relative aspect-square overflow-hidden rounded-2xl bg-muted group"
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            alt={`${alt} - Image ${activeIndex + 1}`}
            className="w-full h-full object-cover select-none touch-none"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: "grabbing" }}
          />
        </AnimatePresence>

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 gap-3">
          {onZoomClick && (
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={onZoomClick}
            >
              <ZoomIn className="w-4 h-4" />
              Zoom
            </Button>
          )}
        </div>

        {/* Discount Badge */}
        {discount && (
          <span className="absolute top-3 left-3 md:top-4 md:left-4 px-3 py-1.5 md:px-4 md:py-2 bg-secondary text-secondary-foreground text-xs md:text-sm font-medium rounded-full z-10">
            -{discount}% OFF
          </span>
        )}

        {/* Navigation Arrows - Desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  activeIndex === index 
                    ? "bg-primary w-4" 
                    : "bg-background/60 hover:bg-background/80"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Swipe Hint - Mobile only, shown briefly */}
        <motion.div
          className="absolute inset-x-0 bottom-16 flex items-center justify-center pointer-events-none md:hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-muted-foreground flex items-center gap-2">
            <ChevronLeft className="w-3 h-3" />
            Swipe to view more
            <ChevronRight className="w-3 h-3" />
          </div>
        </motion.div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all",
              activeIndex === index 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-transparent hover:border-primary/50"
            )}
          >
            <img 
              src={img} 
              alt={`${alt} thumbnail ${index + 1}`} 
              className="w-full h-full object-cover" 
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SwipeableGallery;
