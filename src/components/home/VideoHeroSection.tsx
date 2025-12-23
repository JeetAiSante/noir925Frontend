import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const VideoHeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        {/* Fallback Image */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            backgroundImage: `url(https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop)` 
          }}
        />
        
        {/* Video */}
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
          <source 
            src="https://cdn.pixabay.com/video/2020/05/25/40130-424930959_large.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-foreground/30" />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent/10 blur-[100px] animate-float" />
        <div className="absolute bottom-40 left-20 w-72 h-72 rounded-full bg-secondary/10 blur-[80px] animate-float delay-300" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-primary/5 blur-[60px] animate-pulse" />
        
        {/* Sparkle effects */}
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-accent rounded-full animate-ping" />
        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-secondary rounded-full animate-ping delay-500" />
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-primary rounded-full animate-ping delay-700" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-3xl">
          <div className="space-y-8">
            {/* Brand Badge */}
            <div className="overflow-hidden">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20 animate-fade-up">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="font-accent text-sm text-background/90 tracking-widest uppercase">
                  NOIR925 — Purity. Craft. Legacy.
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="overflow-hidden">
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-background leading-[0.9] animate-fade-up delay-100">
                <span className="block">Where Silver</span>
                <span className="block text-accent mt-2">Meets Soul</span>
              </h1>
            </div>

            {/* Subheading */}
            <div className="overflow-hidden">
              <p className="font-body text-lg md:text-xl text-background/80 max-w-xl leading-relaxed animate-fade-up delay-200">
                Experience the artistry of 92.5% pure sterling silver, handcrafted for 
                moments that transcend time. Each piece tells a story of heritage and elegance.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 animate-fade-up delay-300">
              <Link to="/shop">
                <Button variant="hero" size="xl" className="group">
                  <span>Explore Collection</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="hero-outline" size="xl">
                  Our Craftsmanship
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-6 animate-fade-up delay-400">
              <div className="flex items-center gap-2 text-background/70">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-body text-sm">BIS Hallmarked</span>
              </div>
              <div className="flex items-center gap-2 text-background/70">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-body text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-background/70">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-body text-sm">30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-32 left-8 flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center hover:bg-background/30 transition-colors"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-background" />
          ) : (
            <Play className="w-4 h-4 text-background ml-0.5" />
          )}
        </button>
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center hover:bg-background/30 transition-colors"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-background" />
          ) : (
            <Volume2 className="w-4 h-4 text-background" />
          )}
        </button>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-background/60 hover:text-background transition-colors group"
      >
        <span className="font-body text-xs uppercase tracking-widest">Discover More</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>

      {/* Side Text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4">
        <div className="w-px h-20 bg-background/20" />
        <span className="font-body text-xs text-background/60 tracking-widest [writing-mode:vertical-rl] rotate-180">
          925 STERLING SILVER • SINCE 2020
        </span>
        <div className="w-px h-20 bg-background/20" />
      </div>
    </section>
  );
};

export default VideoHeroSection;
