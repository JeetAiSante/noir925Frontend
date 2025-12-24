import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, Play } from 'lucide-react';

const heroTexts = [
  { title: 'Where Silver', highlight: 'Meets Soul', subtitle: 'Experience the artistry of 92.5% pure sterling silver' },
  { title: 'Crafted for', highlight: 'Eternity', subtitle: 'Handcrafted pieces that transcend generations' },
  { title: 'Elegance', highlight: 'Redefined', subtitle: 'Discover timeless beauty in every design' },
  { title: 'Your Story', highlight: 'Our Silver', subtitle: 'Create memories that last forever' },
];

const VideoHeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Text fade animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTextVisible(false);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
        setIsTextVisible(true);
      }, 600);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for auto-play when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().catch(() => {});
        } else if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const currentText = heroTexts[currentTextIndex];

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            backgroundImage: `url(https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop)` 
          }}
        />
        
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setIsLoaded(true)}
          poster="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop"
        >
          <source 
            src="https://cdn.pixabay.com/video/2022/03/24/111867-692055274_large.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/40" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-accent/10 blur-[100px] animate-float" />
        <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-secondary/10 blur-[80px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-primary/5 blur-[60px] animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-3xl">
          <div className="space-y-6 md:space-y-8">
            {/* Brand Badge */}
            <div className="overflow-hidden">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="font-accent text-sm text-background/90 tracking-[0.2em] uppercase">
                  Purity. Craft. Legacy.
                </span>
              </div>
            </div>

            {/* Animated Main Heading */}
            <div className="overflow-hidden min-h-[180px] md:min-h-[220px]">
              <h1 
                className={`font-display text-5xl md:text-7xl lg:text-8xl text-background leading-[0.95] transition-all duration-700 ${
                  isTextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <span className="block">{currentText.title}</span>
                <span className="block text-accent mt-2">{currentText.highlight}</span>
              </h1>
            </div>

            {/* Animated Subheading */}
            <div className="overflow-hidden min-h-[60px]">
              <p 
                className={`font-body text-lg md:text-xl text-background/80 max-w-xl leading-relaxed transition-all duration-700 delay-100 ${
                  isTextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                {currentText.subtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-6">
              <Link to="/shop">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="group relative overflow-hidden px-8 py-4 bg-accent text-accent-foreground hover:bg-accent/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="relative z-10 font-display tracking-wide">Explore Collection</span>
                  <span className="relative z-10 ml-3 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  variant="hero-outline" 
                  size="lg" 
                  className="group gap-3 px-6 py-3 border-2 border-background/40 hover:border-background/80 bg-transparent hover:bg-background/10 transition-all duration-300"
                >
                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-display tracking-wide">Watch Story</span>
                </Button>
              </Link>
            </div>

            {/* Text Indicators */}
            <div className="flex gap-2 pt-8">
              {heroTexts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsTextVisible(false);
                    setTimeout(() => {
                      setCurrentTextIndex(i);
                      setIsTextVisible(true);
                    }, 300);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentTextIndex 
                      ? 'w-10 bg-accent shadow-[0_0_10px_rgba(var(--accent),0.5)]' 
                      : 'w-3 bg-background/30 hover:bg-background/50'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-background/60 hover:text-background transition-colors group"
      >
        <span className="font-body text-xs uppercase tracking-[0.2em]">Discover</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>

      {/* Side Text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4">
        <div className="w-px h-16 bg-background/20" />
        <span className="font-body text-xs text-background/60 tracking-[0.3em] [writing-mode:vertical-rl] rotate-180">
          925 STERLING SILVER
        </span>
        <div className="w-px h-16 bg-background/20" />
      </div>
    </section>
  );
};

export default VideoHeroSection;
