import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, Play, Pause } from 'lucide-react';

const HeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Timeless Elegance',
      subtitle: 'in Pure Silver',
      description: 'Discover our curated collection of hallmarked 925 sterling silver jewellery, crafted for moments that matter.',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop',
      cta: 'Shop Collection',
      ctaLink: '/shop',
    },
    {
      title: 'Bridal Heritage',
      subtitle: 'Collection 2024',
      description: 'Embrace tradition with contemporary grace. Our bridal pieces celebrate your journey of love.',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&h=1080&fit=crop',
      cta: 'Explore Bridal',
      ctaLink: '/collections/bridal-heritage',
    },
    {
      title: 'Floral Bloom',
      subtitle: 'Nature\'s Poetry',
      description: 'Where petals meet precious metal. Each piece blooms with artisanal craftsmanship.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&h=1080&fit=crop',
      cta: 'Discover Flora',
      ctaLink: '/collections/floral-bloom',
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </div>
      ))}

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-float" />
        <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-secondary/10 blur-3xl animate-float delay-300" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-4 flex items-center">
        <div className="max-w-3xl relative">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ease-out ${
                index === currentSlide
                  ? 'relative opacity-100 translate-y-0'
                  : 'absolute top-0 left-0 opacity-0 translate-y-8 pointer-events-none'
              }`}
            >
              <div className="space-y-5">
                <p className="font-accent text-base md:text-lg text-white/70 tracking-[0.2em] uppercase">
                  NOIR925 Presents
                </p>
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1]">
                  {slide.title}
                  <span className="block text-accent mt-2">{slide.subtitle}</span>
                </h1>
                <p className="font-body text-base md:text-lg text-white/80 max-w-lg leading-relaxed">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link to={slide.ctaLink}>
                    <Button 
                      variant="default" 
                      size="lg"
                      className="bg-white text-black hover:bg-white/90 font-semibold px-8"
                    >
                      {slide.cta}
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
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setIsPlaying(false);
            }}
            className={`h-1 rounded-full transition-all duration-500 ${
              index === currentSlide
                ? 'w-12 bg-white'
                : 'w-4 bg-white/40 hover:bg-white/60'
            }`}
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

export default HeroSection;
