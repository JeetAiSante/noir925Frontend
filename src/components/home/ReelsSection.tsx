import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (reels.length <= 1) return;

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reels.length);
    }, 6000);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [reels.length]);

  // Play active video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex]);

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + reels.length) % reels.length);
    resetAutoPlay();
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % reels.length);
    resetAutoPlay();
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % reels.length);
      }, 6000);
    }
  };

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
      className="py-12 md:py-20 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden" 
      aria-label="Featured Reels"
    >
      <div className="container mx-auto px-4 relative mb-8 md:mb-12">
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

      {/* 3D Stacked Carousel */}
      <div className="relative h-[450px] md:h-[580px] lg:h-[650px] flex items-center justify-center perspective-1000">
        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 md:left-8 lg:left-16 z-30 p-2 md:p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background hover:scale-110 transition-all shadow-lg"
          aria-label="Previous reel"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 md:right-8 lg:right-16 z-30 p-2 md:p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background hover:scale-110 transition-all shadow-lg"
          aria-label="Next reel"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
        </button>

        {/* Cards Container */}
        <div className="relative w-full max-w-6xl h-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {visibleReels.map(({ reel, position, originalIndex }) => {
              const isActive = position === 'center';
              
              // Position and style configurations
              const positionStyles = {
                'far-left': {
                  x: '-85%',
                  scale: 0.55,
                  zIndex: 5,
                  opacity: 0.3,
                  rotateY: 25,
                },
                'left': {
                  x: '-55%',
                  scale: 0.75,
                  zIndex: 10,
                  opacity: 0.6,
                  rotateY: 15,
                },
                'center': {
                  x: '0%',
                  scale: 1,
                  zIndex: 20,
                  opacity: 1,
                  rotateY: 0,
                },
                'right': {
                  x: '55%',
                  scale: 0.75,
                  zIndex: 10,
                  opacity: 0.6,
                  rotateY: -15,
                },
                'far-right': {
                  x: '85%',
                  scale: 0.55,
                  zIndex: 5,
                  opacity: 0.3,
                  rotateY: -25,
                },
              };

              const style = positionStyles[position];

              return (
                <motion.article
                  key={`${reel.id}-${position}`}
                  className="absolute cursor-pointer"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    x: style.x,
                    scale: style.scale,
                    zIndex: style.zIndex,
                    opacity: style.opacity,
                    rotateY: style.rotateY,
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  onClick={() => !isActive && goToSlide(originalIndex)}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div 
                    className={`relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl ${
                      isActive 
                        ? 'w-[240px] md:w-[320px] lg:w-[360px] h-[380px] md:h-[500px] lg:h-[560px]' 
                        : 'w-[200px] md:w-[260px] lg:w-[300px] h-[320px] md:h-[420px] lg:h-[480px]'
                    }`}
                    style={{
                      boxShadow: isActive 
                        ? '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 10px 30px -10px rgba(0, 0, 0, 0.3)'
                        : '0 15px 40px -10px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {/* Video/Thumbnail */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30">
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
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-foreground/10" />

                    {/* Top Bar - Only on Active */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between bg-gradient-to-b from-foreground/60 to-transparent">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center">
                            <div className="w-1 h-1 bg-background rounded-full" />
                            <div className="w-1 h-1 bg-background rounded-full mx-0.5" />
                            <div className="w-1 h-1 bg-background rounded-full" />
                          </div>
                          <p className="text-xs text-background/90 truncate max-w-[180px] md:max-w-[240px]">
                            {reel.subtitle || 'Discover the beauty of silver artistry'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                            className="p-1.5 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? (
                              <VolumeX className="w-4 h-4 text-background" />
                            ) : (
                              <Volume2 className="w-4 h-4 text-background" />
                            )}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="p-1.5 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
                            aria-label="Fullscreen"
                          >
                            <Maximize2 className="w-4 h-4 text-background" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                      <h3 className={`font-display uppercase tracking-wider text-background ${
                        isActive ? 'text-lg md:text-2xl lg:text-3xl' : 'text-sm md:text-lg'
                      }`}>
                        {reel.title}
                      </h3>
                    </div>

                    {/* Bottom Title */}
                    {isActive && (
                      <div className="absolute bottom-20 md:bottom-24 left-0 right-0 text-center">
                        <p className="font-display text-base md:text-xl text-background/90">
                          {reel.subtitle || 'Explore Now'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Product Cards Strip */}
      {activeReel && (
        <div className="container mx-auto px-4 mt-2 md:mt-4">
          <div className="flex justify-center gap-2 md:gap-4">
            {reels.slice(0, 3).map((reel, idx) => (
              <Link
                key={reel.id}
                to={reel.linked_product_id ? `/product/${reel.linked_product_id}` : '/shop'}
                className={`flex items-center gap-2 px-3 py-2 bg-background rounded-full border shadow-sm hover:shadow-md transition-all ${
                  idx === activeIndex % 3 ? 'border-primary' : 'border-border'
                }`}
              >
                {reel.linked_product_image && (
                  <img 
                    src={reel.linked_product_image} 
                    alt={reel.linked_product_name || ''} 
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-muted"
                  />
                )}
                <span className="text-xs md:text-sm font-medium text-foreground truncate max-w-[100px] md:max-w-[150px]">
                  {reel.linked_product_name || 'View Product'}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Indicator Dots */}
      <div className="flex justify-center gap-2 mt-6 md:mt-8">
        {reels.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === activeIndex 
                ? 'w-8 bg-foreground' 
                : 'w-4 bg-muted-foreground/40 hover:bg-muted-foreground/60'
            }`}
            aria-label={`Go to reel ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default ReelsSection;
