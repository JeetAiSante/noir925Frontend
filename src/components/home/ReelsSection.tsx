import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Maximize2, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  const [activeIndex, setActiveIndex] = useState(2);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get section settings from homepage_sections
  const { getSectionSettings, isSectionVisible } = useHomepageSections();
  const sectionSettings = getSectionSettings('reels');
  const autoRotationSpeed = (sectionSettings?.autoRotationSpeed ?? 6) * 1000;
  const pauseOnHover = sectionSettings?.pauseOnHover ?? true;
  const showArrows = sectionSettings?.showArrows ?? true;
  const showDots = sectionSettings?.showDots ?? true;

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

  // Smooth auto-rotation timer with configurable speed
  useEffect(() => {
    if (reels.length <= 1 || isPaused) return;

    autoPlayIntervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev === reels.length - 1 ? 0 : prev + 1));
    }, autoRotationSpeed);

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [reels.length, isPaused, autoRotationSpeed]);

  // Smooth transition for slide change
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  const [[slideDirection], setSlideDirection] = useState([0]);

  const paginate = useCallback((newDirection: number) => {
    setSlideDirection([newDirection]);
    if (newDirection > 0) {
      setActiveIndex((prev) => (prev === reels.length - 1 ? 0 : prev + 1));
    } else {
      setActiveIndex((prev) => (prev === 0 ? reels.length - 1 : prev - 1));
    }
  }, [reels.length]);

  // Play active video, pause others
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      if (video) {
        if (parseInt(index) === activeIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [activeIndex]);

  const handleMouseEnter = () => pauseOnHover && setIsPaused(true);
  const handleMouseLeave = () => pauseOnHover && setIsPaused(false);

  const handlePrev = () => {
    paginate(-1);
  };

  const handleNext = () => {
    paginate(1);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.muted = !isMuted;
    });
  };

  const toggleFullscreen = () => {
    const activeVideo = videoRefs.current[activeIndex];
    if (activeVideo) {
      if (!document.fullscreenElement) {
        activeVideo.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    }
  };

  if (reels.length === 0) return null;

  // Calculate visible reels (5 items centered on activeIndex)
  const getVisibleReels = () => {
    const visible = [];
    const total = reels.length;
    for (let i = -2; i <= 2; i++) {
      const index = (activeIndex + i + total) % total;
      visible.push({ ...reels[index], displayIndex: i, originalIndex: index });
    }
    return visible;
  };

  const visibleReels = getVisibleReels();
  const activeReel = reels[activeIndex];

  return (
    <section 
      className="py-12 md:py-20 bg-background relative overflow-hidden" 
      aria-label="Featured Reels"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl text-foreground mb-3">
            Styling 101 With <span className="text-primary">Silver</span>
          </h2>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Trendsetting silver jewellery suited for every occasion
          </p>
        </header>

        {/* Carousel Container */}
        <div ref={containerRef} className="relative flex items-center justify-center min-h-[400px] md:min-h-[550px]">
          {/* Navigation Arrows */}
          {showArrows && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute left-0 md:left-4 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg border border-border"
                aria-label="Previous reel"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-0 md:right-4 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg border border-border"
                aria-label="Next reel"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </>
          )}

          {/* Reels Carousel with Smooth Animation */}
          <div className="flex items-center justify-center gap-2 md:gap-4 perspective-1000">
            <AnimatePresence mode="popLayout" custom={slideDirection}>
              {visibleReels.map((reel, idx) => {
                const isActive = reel.displayIndex === 0;
                const isAdjacent = Math.abs(reel.displayIndex) === 1;
                const isEdge = Math.abs(reel.displayIndex) === 2;

                return (
                  <motion.article
                    key={`${reel.id}-${reel.displayIndex}`}
                    custom={slideDirection}
                    initial={{ opacity: 0, scale: 0.8, x: reel.displayIndex * 50 }}
                    animate={{ 
                      opacity: isEdge ? 0.5 : isAdjacent ? 0.8 : 1, 
                      scale: isActive ? 1 : isAdjacent ? 0.95 : 0.9,
                      x: reel.displayIndex * (isActive ? 0 : 10),
                      rotateY: reel.displayIndex * -5,
                      filter: isEdge ? 'blur(1px)' : 'blur(0px)',
                    }}
                    transition={{ 
                      duration: 0.6, 
                      ease: [0.25, 0.1, 0.25, 1],
                      opacity: { duration: 0.4 },
                      scale: { duration: 0.5 },
                    }}
                    onClick={() => !isActive && setActiveIndex(reel.originalIndex)}
                    className={`
                      relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer
                      ${isActive 
                        ? 'w-[220px] md:w-[320px] h-[380px] md:h-[520px] z-20 shadow-2xl' 
                        : isAdjacent 
                          ? 'w-[160px] md:w-[240px] h-[280px] md:h-[400px] z-10' 
                          : 'w-[100px] md:w-[180px] h-[200px] md:h-[320px] z-0 hidden sm:block'
                      }
                    `}
                  >
                  {/* Video/Thumbnail */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20">
                    {isActive ? (
                      <video
                        ref={(el) => { videoRefs.current[reel.originalIndex] = el; }}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />

                  {/* Active Reel Controls & Content */}
                  {isActive && (
                    <>
                      {/* Top Bar */}
                      <div className="absolute top-0 left-0 right-0 p-3 md:p-4 flex items-center justify-between">
                        <button className="p-1.5 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors">
                          <MoreVertical className="w-4 h-4 text-background" />
                        </button>
                        <p className="text-xs text-background/90 font-body max-w-[60%] truncate px-2">
                          {reel.subtitle}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                            className="p-1.5 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors"
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
                            className="p-1.5 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors"
                            aria-label="Fullscreen"
                          >
                            <Maximize2 className="w-4 h-4 text-background" />
                          </button>
                        </div>
                      </div>

                      {/* Title in Center */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <h3 className="font-display text-lg md:text-2xl text-background uppercase tracking-wider mb-2">
                          {reel.title.split(' ').slice(0, -1).join(' ')}
                        </h3>
                        <h3 className="font-display text-xl md:text-3xl text-background uppercase tracking-wider">
                          {reel.title.split(' ').slice(-1)}
                        </h3>
                        
                        {/* Decorative Frame */}
                        <div className="mt-4 w-24 md:w-32 h-24 md:h-32 border-2 border-primary/50 rounded-lg flex items-center justify-center">
                          <div className="w-16 md:w-24 h-16 md:h-24 bg-gradient-to-br from-primary/30 to-accent/30 rounded-md flex items-center justify-center">
                            {reel.linked_product_image && (
                              <img 
                                src={reel.linked_product_image} 
                                alt={reel.linked_product_name || 'Product'} 
                                className="w-12 md:w-20 h-12 md:h-20 object-contain"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Title */}
                      <div className="absolute bottom-16 md:bottom-20 left-0 right-0 text-center">
                        <p className="font-body text-sm md:text-base text-background/90">
                          {activeReel?.title?.split(' ').pop() || 'Style'}
                        </p>
                      </div>
                    </>
                  )}
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Linked Products Bar */}
        {reels.some(r => r.linked_product_name) && (
          <nav className="mt-6 md:mt-8" aria-label="Featured products from reels">
            <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {reels.filter(r => r.linked_product_name).slice(0, 3).map((reel) => (
                <Link
                  key={reel.id}
                  to={reel.linked_product_id ? `/product/${reel.linked_product_id}` : '/shop'}
                  className="flex items-center gap-3 px-4 py-2 bg-foreground rounded-full hover:bg-foreground/90 transition-colors min-w-fit"
                >
                  {reel.linked_product_image && (
                    <img 
                      src={reel.linked_product_image} 
                      alt={reel.linked_product_name || 'Product'} 
                      className="w-8 h-8 rounded-full object-cover border border-primary/30"
                    />
                  )}
                  <span className="text-xs md:text-sm text-background font-body whitespace-nowrap">
                    {reel.linked_product_name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-background/60" />
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Pagination Dots */}
        {showDots && (
          <div className="flex items-center justify-center gap-2 mt-6" role="tablist" aria-label="Reel pagination">
            {reels.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'w-8 bg-foreground' 
                    : 'w-4 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Go to reel ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReelsSection;