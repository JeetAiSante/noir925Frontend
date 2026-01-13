import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useHomepageSections } from '@/hooks/useHomepageSections';

interface Reel {
  id: string;
  title: string;
  subtitle: string | null;
  video_url: string;
  thumbnail_url: string | null;
  linked_product_id: string | null;
  linked_product_name: string | null;
  linked_product_image: string | null;
  sort_order: number;
}

const ReelsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe gesture tracking
  const dragX = useMotionValue(0);
  const dragProgress = useTransform(dragX, [-200, 0, 200], [-1, 0, 1]);

  // Get section settings from homepage_sections
  const { getSectionSettings, isSectionVisible } = useHomepageSections();
  const sectionSettings = getSectionSettings('reels');

  // Check visibility
  const isVisible = isSectionVisible('reels');

  const { data: reels = [] } = useQuery({
    queryKey: ['homepage-reels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_reels')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Reel[];
    },
  });

  // Auto-advance carousel
  useEffect(() => {
    if (reels.length <= 1 || isDragging) return;

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reels.length);
    }, 6000);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [reels.length, isDragging]);

  // Play active video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex]);

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + reels.length) % reels.length);
    resetAutoPlay();
  }, [reels.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % reels.length);
    resetAutoPlay();
  }, [reels.length]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    resetAutoPlay();
  }, []);

  const resetAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % reels.length);
      }, 6000);
    }
  }, [reels.length]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  // Handle swipe gestures
  const handleDragStart = () => {
    setIsDragging(true);
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset < -threshold || velocity < -500) {
      goToNext();
    } else if (offset > threshold || velocity > 500) {
      goToPrevious();
    }
    
    dragX.set(0);
    resetAutoPlay();
  };

  // Get visible reels (previous, current, next)
  const getVisibleReels = () => {
    if (reels.length === 0) return [];
    if (reels.length === 1) return [{ reel: reels[0], position: 'center' as const, originalIndex: 0 }];
    if (reels.length === 2) {
      return [
        { reel: reels[(activeIndex - 1 + reels.length) % reels.length], position: 'left' as const, originalIndex: (activeIndex - 1 + reels.length) % reels.length },
        { reel: reels[activeIndex], position: 'center' as const, originalIndex: activeIndex },
        { reel: reels[(activeIndex + 1) % reels.length], position: 'right' as const, originalIndex: (activeIndex + 1) % reels.length },
      ];
    }
    
    const prevIndex = (activeIndex - 1 + reels.length) % reels.length;
    const nextIndex = (activeIndex + 1) % reels.length;
    const farPrevIndex = (activeIndex - 2 + reels.length) % reels.length;
    const farNextIndex = (activeIndex + 2) % reels.length;
    
    return [
      { reel: reels[farPrevIndex], position: 'far-left' as const, originalIndex: farPrevIndex },
      { reel: reels[prevIndex], position: 'left' as const, originalIndex: prevIndex },
      { reel: reels[activeIndex], position: 'center' as const, originalIndex: activeIndex },
      { reel: reels[nextIndex], position: 'right' as const, originalIndex: nextIndex },
      { reel: reels[farNextIndex], position: 'far-right' as const, originalIndex: farNextIndex },
    ];
  };

  if (!isVisible || reels.length === 0) return null;

  const visibleReels = getVisibleReels();
  const activeReel = reels[activeIndex];

  return (
    <section 
      ref={containerRef}
      className="py-10 md:py-16 lg:py-20 bg-gradient-to-b from-muted/20 via-background to-muted/20 relative overflow-hidden" 
      aria-label="Featured Reels"
    >
      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 relative mb-6 md:mb-10">
        {/* Header */}
        <header className="text-center">
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl text-foreground mb-3">
            {sectionSettings?.customTitle || (
              <>Styling 101 With <span className="text-primary">Silver</span></>
            )}
          </h2>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            {sectionSettings?.customSubtitle || 'Trendsetting silver jewellery suited for every occasion'}
          </p>
        </header>
      </div>

      {/* 3D Stacked Carousel - Wider Layout */}
      <motion.div 
        className="relative h-[420px] sm:h-[480px] md:h-[580px] lg:h-[680px] xl:h-[720px] flex items-center justify-center"
        style={{ perspective: 1200 }}
      >
        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-1 sm:left-4 md:left-8 lg:left-12 xl:left-20 z-30 p-2 md:p-3 lg:p-4 rounded-full bg-background/90 backdrop-blur-md border border-border/50 hover:bg-background hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl group"
          aria-label="Previous reel"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-1 sm:right-4 md:right-8 lg:right-12 xl:right-20 z-30 p-2 md:p-3 lg:p-4 rounded-full bg-background/90 backdrop-blur-md border border-border/50 hover:bg-background hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl group"
          aria-label="Next reel"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-foreground group-hover:text-primary transition-colors" />
        </button>

        {/* Swipeable Cards Container */}
        <motion.div 
          className="relative w-full max-w-[1800px] h-full flex items-center justify-center touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
        >
          <AnimatePresence mode="popLayout">
            {visibleReels.map(({ reel, position, originalIndex }) => {
              const isActive = position === 'center';
              
              // Position and style configurations - Wider spacing
              const positionStyles = {
                'far-left': {
                  x: '-95%',
                  scale: 0.5,
                  zIndex: 5,
                  opacity: 0.25,
                  rotateY: 30,
                },
                'left': {
                  x: '-58%',
                  scale: 0.72,
                  zIndex: 10,
                  opacity: 0.55,
                  rotateY: 18,
                },
                'center': {
                  x: '0%',
                  scale: 1,
                  zIndex: 20,
                  opacity: 1,
                  rotateY: 0,
                },
                'right': {
                  x: '58%',
                  scale: 0.72,
                  zIndex: 10,
                  opacity: 0.55,
                  rotateY: -18,
                },
                'far-right': {
                  x: '95%',
                  scale: 0.5,
                  zIndex: 5,
                  opacity: 0.25,
                  rotateY: -30,
                },
              };

              const style = positionStyles[position];

              return (
                <motion.article
                  key={`${reel.id}-${position}`}
                  className="absolute cursor-pointer select-none"
                  initial={{ opacity: 0, scale: 0.4, rotateY: 0 }}
                  animate={{
                    x: style.x,
                    scale: style.scale,
                    zIndex: style.zIndex,
                    opacity: style.opacity,
                    rotateY: style.rotateY,
                  }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 260,
                    damping: 30,
                    mass: 1,
                  }}
                  onClick={() => !isActive && !isDragging && goToSlide(originalIndex)}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  whileHover={!isActive ? { scale: style.scale * 1.05 } : {}}
                >
                  <div 
                    className={`relative overflow-hidden rounded-2xl md:rounded-3xl lg:rounded-[2rem] ${
                      isActive 
                        ? 'w-[220px] sm:w-[260px] md:w-[340px] lg:w-[400px] xl:w-[440px] h-[360px] sm:h-[400px] md:h-[500px] lg:h-[580px] xl:h-[620px]' 
                        : 'w-[180px] sm:w-[200px] md:w-[280px] lg:w-[320px] xl:w-[360px] h-[300px] sm:h-[340px] md:h-[420px] lg:h-[500px] xl:h-[540px]'
                    }`}
                    style={{
                      boxShadow: isActive 
                        ? '0 30px 80px -20px rgba(0, 0, 0, 0.5), 0 15px 40px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                        : '0 20px 50px -15px rgba(0, 0, 0, 0.35)',
                    }}
                  >
                    {/* Video/Thumbnail */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20">
                      {isActive ? (
                        <video
                          ref={videoRef}
                          src={reel.video_url}
                          poster={reel.thumbnail_url || undefined}
                          className="w-full h-full object-cover"
                          muted={isMuted}
                          loop
                          playsInline
                          autoPlay
                        />
                      ) : (
                        <img
                          src={reel.thumbnail_url || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=600&fit=crop'}
                          alt={reel.title}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/20 to-transparent" />

                    {/* Top Bar - Only on Active */}
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="absolute top-0 left-0 right-0 p-3 md:p-4 flex items-center justify-between bg-gradient-to-b from-foreground/70 to-transparent"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center gap-0.5">
                            <div className="w-1 h-1 bg-background rounded-full" />
                            <div className="w-1 h-1 bg-background rounded-full" />
                            <div className="w-1 h-1 bg-background rounded-full" />
                          </div>
                          <p className="text-xs md:text-sm text-background/90 truncate max-w-[150px] sm:max-w-[180px] md:max-w-[260px]">
                            {reel.subtitle || 'Discover the beauty of silver artistry'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                            className="p-1.5 md:p-2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 transition-all duration-200 hover:scale-110"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? (
                              <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-background" />
                            ) : (
                              <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-background" />
                            )}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="p-1.5 md:p-2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 transition-all duration-200 hover:scale-110"
                            aria-label="Fullscreen"
                          >
                            <Maximize2 className="w-4 h-4 md:w-5 md:h-5 text-background" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Center Content */}
                    <motion.div 
                      className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <h3 className={`font-display uppercase tracking-wider text-background drop-shadow-lg ${
                        isActive ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl' : 'text-sm md:text-lg lg:text-xl'
                      }`}>
                        {reel.title}
                      </h3>
                    </motion.div>

                    {/* Bottom Title */}
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="absolute bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-28 left-0 right-0 text-center"
                      >
                        <p className="font-display text-sm sm:text-base md:text-xl lg:text-2xl text-background/90 drop-shadow-lg">
                          {reel.subtitle || 'Explore Now'}
                        </p>
                      </motion.div>
                    )}

                    {/* Shine Effect on Active */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        style={{
                          background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                        }}
                      />
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Swipe Hint for Mobile */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Swipe to explore</span>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>

      {/* Product Cards Strip */}
      {activeReel && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-[1600px] mx-auto px-4 mt-2 md:mt-4"
        >
          <div className="flex justify-center gap-2 md:gap-3 lg:gap-4 flex-wrap">
            {reels.slice(0, 4).map((reel, idx) => (
              <Link
                key={reel.id}
                to={reel.linked_product_id ? `/product/${reel.linked_product_id}` : '/shop'}
                className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-background rounded-full border shadow-sm hover:shadow-lg transition-all duration-300 group ${
                  idx === activeIndex % 4 ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-primary/50'
                }`}
              >
                {reel.linked_product_image && (
                  <img 
                    src={reel.linked_product_image} 
                    alt={reel.linked_product_name || ''} 
                    className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover border border-muted group-hover:scale-110 transition-transform duration-300"
                  />
                )}
                <span className="text-xs md:text-sm font-medium text-foreground truncate max-w-[80px] sm:max-w-[100px] md:max-w-[140px] lg:max-w-[180px]">
                  {reel.linked_product_name || 'View Product'}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Indicator Dots */}
      <div className="flex justify-center gap-2 md:gap-3 mt-6 md:mt-8">
        {reels.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out ${
              idx === activeIndex 
                ? 'w-8 md:w-10 bg-primary shadow-lg shadow-primary/30' 
                : 'w-4 md:w-5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to reel ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default ReelsSection;
