import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFestivalTheme } from '@/context/FestivalThemeContext';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  button_text: string | null;
  link: string | null;
  position: string;
  is_active: boolean;
}

const DynamicHeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeTheme } = useFestivalTheme();

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('position', 'hero')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setBanners(data);
      } else {
        // Fallback banners
        setBanners([
          {
            id: '1',
            title: 'Timeless Elegance',
            subtitle: 'in Pure Silver',
            description: 'Discover our curated collection of hallmarked 925 sterling silver jewellery, crafted for moments that matter.',
            image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop',
            button_text: 'Shop Collection',
            link: '/shop',
            position: 'hero',
            is_active: true,
          },
          {
            id: '2',
            title: 'Bridal Heritage',
            subtitle: 'Collection 2024',
            description: 'Embrace tradition with contemporary grace. Our bridal pieces celebrate your journey of love.',
            image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&h=1080&fit=crop',
            button_text: 'Explore Bridal',
            link: '/collections/bridal-heritage',
            position: 'hero',
            is_active: true,
          },
        ]);
      }
      setIsLoading(false);
    };

    fetchBanners();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('hero-banners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
        fetchBanners();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, banners.length]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${banner.image_url})` }}
          />
          <div 
            className="absolute inset-0" 
            style={{ 
              background: activeTheme 
                ? `linear-gradient(to right, ${activeTheme.background_color}cc, ${activeTheme.background_color}80, transparent)`
                : 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.5), transparent)'
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </div>
      ))}

      {/* Festival Theme Overlay */}
      {activeTheme && (
        <div 
          className="absolute inset-0 pointer-events-none z-[1] opacity-20"
          style={{
            background: `radial-gradient(ellipse at center, ${activeTheme.primary_color}40, transparent 70%)`
          }}
        />
      )}

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        <div 
          className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl animate-float"
          style={{ backgroundColor: activeTheme ? `${activeTheme.accent_color}20` : 'hsl(var(--accent) / 0.1)' }}
        />
        <div 
          className="absolute bottom-40 left-20 w-48 h-48 rounded-full blur-3xl animate-float delay-300"
          style={{ backgroundColor: activeTheme ? `${activeTheme.secondary_color}20` : 'hsl(var(--secondary) / 0.1)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-4 flex items-center">
        <div className="max-w-3xl relative">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`transition-all duration-700 ease-out ${
                index === currentSlide
                  ? 'relative opacity-100 translate-y-0'
                  : 'absolute top-0 left-0 opacity-0 translate-y-8 pointer-events-none'
              }`}
            >
              <div className="space-y-5">
                <p className="font-accent text-base md:text-lg text-white/70 tracking-[0.2em] uppercase">
                  {activeTheme?.special_offer || 'NOIR925 Presents'}
                </p>
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1]">
                  {banner.title}
                  <span 
                    className="block mt-2"
                    style={{ color: activeTheme?.primary_color || 'hsl(var(--accent))' }}
                  >
                    {banner.subtitle}
                  </span>
                </h1>
                <p className="font-body text-base md:text-lg text-white/80 max-w-lg leading-relaxed">
                  {banner.description}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link to={banner.link || '/shop'}>
                    <Button 
                      variant="default" 
                      size="lg"
                      className="font-semibold px-8"
                      style={{
                        backgroundColor: activeTheme?.primary_color || 'white',
                        color: activeTheme ? '#000' : '#000'
                      }}
                    >
                      {banner.button_text || 'Shop Now'}
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-white/50 text-white hover:bg-white/10 px-8"
                    >
                      Our Story
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setIsPlaying(false);
              }}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: index === currentSlide ? '48px' : '16px',
                backgroundColor: index === currentSlide 
                  ? (activeTheme?.primary_color || 'white') 
                  : 'rgba(255,255,255,0.4)'
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="ml-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 text-white" />
            ) : (
              <Play className="w-3 h-3 text-white ml-0.5" />
            )}
          </button>
        </div>
      )}

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors animate-bounce"
      >
        <span className="font-body text-xs uppercase tracking-widest">Explore</span>
        <ChevronDown className="w-5 h-5" />
      </button>

      {/* Side Text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col items-center gap-4">
        <div className="w-px h-20 bg-white/20" />
        <span className="font-body text-xs text-white/60 tracking-widest [writing-mode:vertical-rl] rotate-180">
          925 STERLING SILVER
        </span>
        <div className="w-px h-20 bg-white/20" />
      </div>
    </section>
  );
};

export default DynamicHeroSection;
