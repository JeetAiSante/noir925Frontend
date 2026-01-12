import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
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
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Get section settings from homepage_sections
  const { getSectionSettings, isSectionVisible } = useHomepageSections();
  const sectionSettings = getSectionSettings('reels');
  const scrollSpeed = sectionSettings?.scrollSpeed ?? 1;
  const pauseOnHover = sectionSettings?.pauseOnHover ?? true;

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

  // Duplicate reels for seamless infinite scroll
  const duplicatedReels = [...reels, ...reels, ...reels];

  // Smooth continuous scrolling animation
  useEffect(() => {
    if (reels.length === 0 || !scrollRef.current) return;

    let scrollPosition = 0;
    const scrollContainer = scrollRef.current;
    const singleSetWidth = scrollContainer.scrollWidth / 3;
    const isPaused = pauseOnHover && hoveredIndex !== null;

    const animate = () => {
      if (!isPaused) {
        scrollPosition += scrollSpeed;
        
        // Reset position for seamless loop
        if (scrollPosition >= singleSetWidth) {
          scrollPosition = 0;
        }
        
        scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [reels.length, scrollSpeed, hoveredIndex, pauseOnHover]);

  // Autoplay videos that are hovered
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      if (video) {
        const idx = parseInt(index);
        if (idx === hoveredIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [hoveredIndex]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.muted = !isMuted;
    });
  };

  const toggleFullscreen = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (!document.fullscreenElement) {
        video.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    }
  };

  if (!isVisible || reels.length === 0) return null;

  return (
    <section 
      ref={containerRef}
      className="py-12 md:py-20 bg-background relative overflow-hidden" 
      aria-label="Featured Reels"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20" />
      
      <div className="container mx-auto px-4 relative mb-8">
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

      {/* Continuous Scrolling Carousel */}
      <div className="relative overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-6 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {duplicatedReels.map((reel, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <motion.article
                key={`${reel.id}-${idx}`}
                className="relative flex-shrink-0 w-[200px] md:w-[280px] h-[360px] md:h-[480px] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Video/Thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20">
                  {isHovered ? (
                    <video
                      ref={(el) => { videoRefs.current[idx] = el; }}
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

                {/* Hover Controls */}
                {isHovered && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                      className="p-2 rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-colors"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-background" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-background" />
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFullscreen(idx); }}
                      className="p-2 rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-colors"
                      aria-label="Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4 text-background" />
                    </button>
                  </div>
                )}

                {/* Title in Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                  <h3 className="font-display text-lg md:text-xl text-background uppercase tracking-wider mb-1">
                    {reel.title}
                  </h3>
                  {reel.subtitle && (
                    <p className="text-xs md:text-sm text-background/80">
                      {reel.subtitle}
                    </p>
                  )}
                </div>

                {/* Product Link at Bottom */}
                {reel.linked_product_name && (
                  <Link
                    to={reel.linked_product_id ? `/product/${reel.linked_product_id}` : '/shop'}
                    className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {reel.linked_product_image && (
                      <img 
                        src={reel.linked_product_image} 
                        alt={reel.linked_product_name} 
                        className="w-8 h-8 rounded-full object-cover border border-primary/30"
                      />
                    )}
                    <span className="text-xs font-medium text-foreground truncate flex-1">
                      {reel.linked_product_name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* View All Link */}
      <div className="container mx-auto px-4 mt-8 text-center">
        <Link to="/shop">
          <Button variant="outline" size="lg" className="rounded-full">
            Explore Collection
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default ReelsSection;
