import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, Sparkles, Award, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  video_url: string | null;
  is_video: boolean | null;
  link: string | null;
  button_text: string | null;
}

const defaultTexts = [
  { title: 'Your Elegant', highlight: 'Statement', subtitle: 'Get the best designed jewelry from the certified best craftsmen from around the world.' },
  { title: 'Timeless', highlight: 'Elegance', subtitle: 'Discover handcrafted masterpieces that define luxury and sophistication.' },
  { title: 'Pure Silver', highlight: 'Artistry', subtitle: 'Experience the brilliance of 925 sterling silver in every piece.' },
];

const categoryItems = [
  { name: 'Earrings', icon: '✧', link: '/shop?category=earrings' },
  { name: 'Rings', icon: '◇', link: '/shop?category=rings' },
  { name: 'Bracelets', icon: '○', link: '/shop?category=bracelets' },
];

const LuxuryHeroSection = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Fetch banners from database
  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('position', 'hero')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(1);

      if (!error && data && data.length > 0) {
        setBanners(data);
      }
    };

    fetchBanners();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('hero-banners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, fetchBanners)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Text animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % defaultTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Video autoplay with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
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

  const currentBanner = banners[0];
  const hasVideo = currentBanner?.is_video && currentBanner?.video_url;
  const currentText = defaultTexts[currentTextIndex];

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FAF8F5] to-[#F0EDE6] overflow-hidden"
    >
      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C6644' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Main Content Grid */}
      <div className="relative min-h-screen container mx-auto px-4 lg:px-8 py-8 lg:py-0">
        <div className="grid lg:grid-cols-2 min-h-screen items-center gap-8 lg:gap-12">
          
          {/* Left Side - Text Content */}
          <div className="order-2 lg:order-1 flex flex-col justify-center pt-20 lg:pt-0">
            <div className="space-y-6 lg:space-y-8 max-w-xl">
              
              {/* Animated Main Heading */}
              <div className="overflow-hidden min-h-[180px] md:min-h-[220px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTextIndex}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] tracking-tight">
                      <span className="block font-light italic text-foreground/80">{currentText.title}</span>
                      <motion.span 
                        className="block mt-1 font-semibold text-[#B8860B]"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        {currentText.highlight}
                      </motion.span>
                    </h1>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Animated Description */}
              <div className="overflow-hidden min-h-[60px]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentTextIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="font-body text-base md:text-lg text-foreground/70 leading-relaxed max-w-md"
                  >
                    {currentText.subtitle}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <Link to="/shop">
                  <Button 
                    size="lg" 
                    className="group relative overflow-hidden px-8 py-6 bg-[#B8860B] hover:bg-[#9A7209] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-500 rounded-full font-display tracking-wide"
                  >
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-[#B8860B] via-[#D4A84B] to-[#B8860B]"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      style={{ opacity: 0.3 }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      Explore
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                  </Button>
                </Link>

                <Link to="/about" className="group flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors">
                  <span className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center group-hover:border-foreground/40 transition-colors">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ▶
                    </motion.span>
                  </span>
                  <span className="font-body text-sm">Watch Video</span>
                </Link>
              </motion.div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-3 pt-6 border-t border-foreground/10"
              >
                <div className="flex items-center gap-1">
                  <Award className="w-5 h-5 text-[#B8860B]" />
                  <span className="text-xs font-medium text-foreground/60">Gold certified</span>
                </div>
                <span className="text-foreground/20">|</span>
                <p className="text-xs text-foreground/50">
                  All jewelries are certified for authenticity & purity of gold
                </p>
              </motion.div>

              {/* Progress Indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-2 pt-4"
              >
                {defaultTexts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTextIndex(i)}
                    className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
                    style={{ width: i === currentTextIndex ? '40px' : '10px' }}
                    aria-label={`Go to slide ${i + 1}`}
                  >
                    <span className="absolute inset-0 bg-foreground/20" />
                    {i === currentTextIndex && (
                      <motion.span
                        className="absolute inset-0 bg-[#B8860B] origin-left"
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

          {/* Right Side - Product Showcase */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center pt-24 lg:pt-0">
            {/* Central Product Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Decorative Circle Background */}
              <div className="absolute inset-0 -m-8 lg:-m-16">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#F5F0E8]/80 to-[#EDE5D8]/60 shadow-[inset_0_2px_20px_rgba(184,134,11,0.1)]" />
              </div>

              {/* Video/Image Container */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px] rounded-full overflow-hidden bg-gradient-to-br from-[#F8F4EE] to-[#F0EBE1] shadow-2xl">
                {hasVideo ? (
                  <video
                    ref={videoRef}
                    className={`absolute inset-0 w-full h-full object-cover scale-150 transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={() => setIsVideoLoaded(true)}
                    poster={currentBanner?.image_url}
                  >
                    <source src={currentBanner.video_url!} type="video/mp4" />
                  </video>
                ) : (
                  <img 
                    src={currentBanner?.image_url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop"}
                    alt="Featured Jewelry"
                    className="absolute inset-0 w-full h-full object-cover scale-110"
                  />
                )}

                {/* Fallback placeholder while loading */}
                {hasVideo && !isVideoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-8 h-8 text-[#B8860B]/40" />
                    </motion.div>
                  </div>
                )}

                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                  animate={{ 
                    x: ['-100%', '100%'],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatDelay: 2,
                    ease: 'easeInOut'
                  }}
                />
              </div>

              {/* Floating Sparkles */}
              <motion.div
                className="absolute -top-4 -right-4"
                animate={{ 
                  y: [-5, 5, -5],
                  rotate: [0, 10, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-8 h-8 text-[#B8860B]/60" />
              </motion.div>
            </motion.div>

            {/* Category Cards - Right Side */}
            <div className="absolute right-0 lg:right-[-20px] top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4">
              {categoryItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Link 
                    to={item.link}
                    className="group flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-x-2 border border-foreground/5"
                  >
                    <span className="w-10 h-10 rounded-full bg-[#F8F4EE] flex items-center justify-center text-lg">
                      {item.icon}
                    </span>
                    <span className="font-display text-sm text-foreground/80 group-hover:text-[#B8860B] transition-colors">
                      {item.name}
                    </span>
                    <motion.span
                      className="text-foreground/40 group-hover:text-[#B8860B] transition-colors"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={scrollToContent}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/40 hover:text-foreground/70 transition-colors group"
      >
        <span className="font-body text-xs uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>

      {/* Rating Badge - Bottom Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-8 hidden lg:flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg"
      >
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-[#F0EBE1] border-2 border-white flex items-center justify-center text-xs">
              {i}k
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3 h-3 fill-[#B8860B] text-[#B8860B]" />
            ))}
          </div>
          <p className="text-xs text-foreground/60">10k+ Happy Customers</p>
        </div>
      </motion.div>
    </section>
  );
};

export default LuxuryHeroSection;