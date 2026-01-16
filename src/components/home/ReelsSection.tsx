import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHomepageSections } from '@/hooks/useHomepageSections';
import { useSwipeGesture, triggerHapticFeedback } from '@/hooks/useSwipeGesture';

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
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const { getSectionSettings, isSectionVisible } = useHomepageSections();
  const sectionSettings = getSectionSettings('reels');
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

  const goToPrevious = useCallback(() => {
    if (reels.length === 0) return;
    triggerHapticFeedback('light');
    setActiveIndex((prev) => (prev - 1 + reels.length) % reels.length);
  }, [reels.length]);

  const goToNext = useCallback(() => {
    if (reels.length === 0) return;
    triggerHapticFeedback('light');
    setActiveIndex((prev) => (prev + 1) % reels.length);
  }, [reels.length]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Swipe gesture support
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
    threshold: 40,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sectionRef.current?.contains(document.activeElement) && 
          document.activeElement !== sectionRef.current) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Auto-advance carousel with slow timing
  useEffect(() => {
    if (reels.length <= 1 || isHovered) return;

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reels.length);
    }, 5000);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [reels.length, isHovered]);

  // Play active video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  if (!isVisible || reels.length === 0) return null;

  const activeReel = reels[activeIndex];

  // Calculate positions for the 3-card view
  const getCardPosition = (index: number) => {
    const diff = index - activeIndex;
    const wrappedDiff = ((diff + reels.length) % reels.length);
    
    if (wrappedDiff === 0) return 'center';
    if (wrappedDiff === 1 || (diff === -(reels.length - 1))) return 'right';
    if (wrappedDiff === reels.length - 1 || diff === -1) return 'left';
    return 'hidden';
  };

  return (
    <section 
      ref={sectionRef}
      tabIndex={0}
      className="py-6 sm:py-10 md:py-14 lg:py-16 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden outline-none" 
      aria-label="Featured Reels"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...swipeHandlers}
    >
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 rounded-full bg-primary/5 blur-[80px] sm:blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 rounded-full bg-accent/5 blur-[100px] sm:blur-[120px]" />
      </div>

      {/* Header - Compact */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 relative mb-4 sm:mb-6 md:mb-8">
        <header className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2 sm:mb-3">
              <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary fill-primary" />
              <span className="font-accent text-[9px] sm:text-[10px] md:text-xs text-primary tracking-widest uppercase">Style Stories</span>
            </span>
            <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-foreground mb-1.5 sm:mb-2">
              {sectionSettings?.customTitle || (
                <>Styling 101 With <span className="text-primary">Silver</span></>
              )}
            </h2>
            <p className="font-body text-[10px] sm:text-xs md:text-sm text-muted-foreground max-w-xs sm:max-w-md mx-auto">
              {sectionSettings?.customSubtitle || 'Discover trending styles & inspiration'}
            </p>
          </motion.div>
        </header>
      </div>

      {/* Carousel Container - Compact Height */}
      <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4">
        <div 
          className="relative h-[260px] xs:h-[300px] sm:h-[360px] md:h-[420px] lg:h-[480px] flex items-center justify-center"
          style={{ perspective: '1000px' }}
        >
          {/* Navigation Arrows - Elegant */}
          <motion.button
            onClick={goToPrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-0 sm:left-2 md:left-4 z-30 p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-full bg-background/80 backdrop-blur-md border border-border/40 hover:bg-background hover:border-primary/30 transition-all duration-500 shadow-lg group"
            aria-label="Previous reel"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
          </motion.button>

          <motion.button
            onClick={goToNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-0 sm:right-2 md:right-4 z-30 p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-full bg-background/80 backdrop-blur-md border border-border/40 hover:bg-background hover:border-primary/30 transition-all duration-500 shadow-lg group"
            aria-label="Next reel"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
          </motion.button>

          {/* Cards */}
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {reels.map((reel, index) => {
                const position = getCardPosition(index);
                if (position === 'hidden') return null;
                
                const isActive = position === 'center';
                
                const variants = {
                  center: {
                    x: 0,
                    scale: 1,
                    zIndex: 20,
                    opacity: 1,
                    rotateY: 0,
                    filter: 'brightness(1)',
                  },
                  left: {
                    x: '-45%',
                    scale: 0.75,
                    zIndex: 10,
                    opacity: 0.7,
                    rotateY: 12,
                    filter: 'brightness(0.8)',
                  },
                  right: {
                    x: '45%',
                    scale: 0.75,
                    zIndex: 10,
                    opacity: 0.7,
                    rotateY: -12,
                    filter: 'brightness(0.8)',
                  },
                };

                return (
                  <motion.article
                    key={reel.id}
                    className="absolute cursor-pointer select-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={variants[position]}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => !isActive && goToSlide(index)}
                    style={{ transformStyle: 'preserve-3d' }}
                    whileHover={!isActive ? { scale: 0.78, opacity: 0.85 } : {}}
                  >
                    <div 
                      className={`relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl transition-all duration-700 ${
                        isActive 
                          ? 'w-[140px] xs:w-[160px] sm:w-[200px] md:w-[260px] lg:w-[300px] h-[220px] xs:h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px]' 
                          : 'w-[110px] xs:w-[130px] sm:w-[160px] md:w-[200px] lg:w-[240px] h-[180px] xs:h-[210px] sm:h-[260px] md:h-[320px] lg:h-[360px]'
                      }`}
                      style={{
                        boxShadow: isActive
                          ? '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08) inset'
                          : '0 15px 40px -10px rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      {/* Video/Thumbnail */}
                      <div className="absolute inset-0 bg-muted">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/10 to-transparent" />

                      {/* Active Controls */}
                      {isActive && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10"
                        >
                          <button
                            onClick={toggleMute}
                            className="p-1.5 sm:p-2 rounded-full bg-foreground/20 backdrop-blur-md hover:bg-foreground/30 transition-all duration-300"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? (
                              <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-background" />
                            ) : (
                              <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-background" />
                            )}
                          </button>
                        </motion.div>
                      )}

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 md:p-4 lg:p-5">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: isActive ? 0.2 : 0, duration: 0.5 }}
                        >
                          <h3 className={`font-display text-background mb-0.5 sm:mb-1 line-clamp-2 ${
                            isActive 
                              ? 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl' 
                              : 'text-[10px] sm:text-xs'
                          }`}>
                            {reel.title}
                          </h3>
                          {isActive && reel.subtitle && (
                            <p className="font-body text-[9px] sm:text-[10px] md:text-xs text-background/70 line-clamp-1">
                              {reel.subtitle}
                            </p>
                          )}
                        </motion.div>

                        {/* Product Link - Active Only */}
                        {isActive && reel.linked_product_id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                          >
                            <Link
                              to={`/product/${reel.linked_product_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 md:mt-3 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-background/20 backdrop-blur-md rounded-full border border-background/30 hover:bg-background/30 transition-all duration-300 group"
                            >
                              {reel.linked_product_image && (
                                <img 
                                  src={reel.linked_product_image} 
                                  alt="" 
                                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full object-cover border border-background/50"
                                />
                              )}
                              <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-background truncate max-w-[60px] sm:max-w-[80px] md:max-w-[100px]">
                                {reel.linked_product_name || 'Shop Now'}
                              </span>
                              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-background/70 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </motion.div>
                        )}
                      </div>

                      {/* Subtle Shine */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ 
                            duration: 3,
                            ease: 'linear',
                            repeat: Infinity,
                            repeatDelay: 4,
                          }}
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                            width: '50%',
                          }}
                        />
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Indicator Dots - Minimal */}
        <div className="flex justify-center gap-1 sm:gap-1.5 md:gap-2 mt-3 sm:mt-4 md:mt-6">
          {reels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`rounded-full transition-all duration-500 ease-out ${
                idx === activeIndex 
                  ? 'w-5 sm:w-6 md:w-8 h-1 sm:h-1.5 bg-primary' 
                  : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to reel ${idx + 1}`}
            />
          ))}
        </div>

        {/* Keyboard Hint */}
        <div className="hidden md:flex justify-center mt-2 sm:mt-3">
          <span className="text-[9px] sm:text-[10px] text-muted-foreground/50">
            Use ← → arrow keys to navigate
          </span>
        </div>
      </div>
    </section>
  );
};

export default ReelsSection;
