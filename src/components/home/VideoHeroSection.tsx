import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, Play, Sparkles, Diamond } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Text animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for auto-play
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
    <section ref={sectionRef} className="relative h-screen min-h-[700px] overflow-hidden">
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

        {/* Premium Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-foreground/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-foreground/50" />
      </div>

      {/* Animated Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glowing Orbs */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, hsla(40, 45%, 65%, 0.15) 0%, transparent 70%)' }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, hsla(350, 45%, 75%, 0.12) 0%, transparent 70%)' }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Sparkle Effects */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${15 + (i * 10)}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-4 h-4 text-accent/40" />
          </motion.div>
        ))}

        {/* Floating Diamond Icons */}
        <motion.div
          className="absolute top-1/3 right-[15%]"
          animate={{ 
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Diamond className="w-8 h-8 text-accent/30" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-4xl">
          <div className="space-y-6 md:space-y-8">
            {/* Brand Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="overflow-hidden"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-background/10 backdrop-blur-md border border-background/20 shadow-lg">
                <motion.span 
                  className="w-2 h-2 bg-accent rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="font-accent text-sm text-background/90 tracking-[0.25em] uppercase">
                  Purity • Craft • Legacy
                </span>
              </div>
            </motion.div>

            {/* Animated Main Heading */}
            <div className="overflow-hidden min-h-[200px] md:min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentTextIndex}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-background leading-[0.9] tracking-tight"
                >
                  <span className="block">{currentText.title}</span>
                  <motion.span 
                    className="block mt-2 md:mt-4"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    <span className="relative">
                      <span className="text-accent">{currentText.highlight}</span>
                      <motion.span
                        className="absolute -bottom-2 left-0 h-1 bg-accent/50"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </span>
                  </motion.span>
                </motion.h1>
              </AnimatePresence>
            </div>

            {/* Animated Subheading */}
            <div className="overflow-hidden min-h-[80px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTextIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="font-body text-lg md:text-xl lg:text-2xl text-background/75 max-w-2xl leading-relaxed"
                >
                  {currentText.subtitle}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap items-center gap-4 md:gap-6 pt-4"
            >
              <Link to="/shop">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden px-8 md:px-10 py-6 md:py-7 bg-accent hover:bg-accent/90 text-accent-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-full"
                >
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-accent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    style={{ opacity: 0.3 }}
                  />
                  <span className="relative z-10 font-display text-base md:text-lg tracking-wide">
                    Explore Collection
                  </span>
                  <motion.span 
                    className="relative z-10 ml-3 text-lg"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="group gap-3 px-6 md:px-8 py-6 md:py-7 border-2 border-background/30 hover:border-background/60 bg-background/5 hover:bg-background/10 backdrop-blur-sm transition-all duration-500 rounded-full text-background"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="w-5 h-5 fill-current" />
                  </motion.div>
                  <span className="font-display text-base md:text-lg tracking-wide">Our Story</span>
                </Button>
              </Link>
            </motion.div>

            {/* Progress Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-3 pt-8"
            >
              {heroTexts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTextIndex(i)}
                  className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
                  style={{ width: i === currentTextIndex ? '48px' : '12px' }}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  <span className="absolute inset-0 bg-background/30" />
                  {i === currentTextIndex && (
                    <motion.span
                      className="absolute inset-0 bg-accent origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 5, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-background/50 hover:text-background transition-colors group"
      >
        <span className="font-body text-xs uppercase tracking-[0.3em]">Discover</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.button>

      {/* Side Decorative Text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-6">
        <motion.div 
          className="w-px h-20 bg-gradient-to-b from-transparent via-background/30 to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
        <motion.span 
          className="font-body text-xs text-background/40 tracking-[0.4em] [writing-mode:vertical-rl] rotate-180"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          925 STERLING SILVER
        </motion.span>
        <motion.div 
          className="w-px h-20 bg-gradient-to-b from-transparent via-background/30 to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 1 }}
        />
      </div>

      {/* Left Side Stats */}
      <div className="absolute left-8 bottom-24 hidden xl:flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="text-background/60"
        >
          <p className="font-display text-3xl text-background">10K+</p>
          <p className="font-body text-xs uppercase tracking-wider">Happy Customers</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4 }}
          className="text-background/60"
        >
          <p className="font-display text-3xl text-background">500+</p>
          <p className="font-body text-xs uppercase tracking-wider">Unique Designs</p>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoHeroSection;
