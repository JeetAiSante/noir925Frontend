import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, Sparkles, Award, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useCategories, useProducts } from '@/hooks/useProducts';

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

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
}

const defaultTexts = [
  { title: 'Your Elegant', highlight: 'Statement', subtitle: 'Get the best designed jewelry from the certified best craftsmen from around the world.' },
  { title: 'Timeless', highlight: 'Elegance', subtitle: 'Discover handcrafted masterpieces that define luxury and sophistication.' },
  { title: 'Pure Silver', highlight: 'Artistry', subtitle: 'Experience the brilliance of 925 sterling silver in every piece.' },
];

const LuxuryHeroSection = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Fetch categories from database
  const { data: categories = [] } = useCategories();
  
  // Fetch bestseller products for rotation
  const { data: bestsellers = [] } = useProducts({ bestseller: true, limit: 6 });

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

  // Product rotation cycle
  useEffect(() => {
    if (bestsellers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % bestsellers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bestsellers.length]);

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
  const currentProduct = bestsellers[currentProductIndex];

  // Get top 6 categories for sidebar
  const sidebarCategories = categories.slice(0, 6).map((cat) => ({
    name: cat.name,
    icon: getCategoryIcon(cat.slug),
    link: `/shop?category=${cat.slug}`,
    image: cat.image_url,
  }));

  function getCategoryIcon(slug: string): string {
    const icons: Record<string, string> = {
      rings: '💍',
      necklaces: '📿',
      bracelets: '⭕',
      earrings: '✧',
      anklets: '○',
      pendants: '◇',
      chains: '⛓',
      wedding: '💎',
    };
    return icons[slug] || '✦';
  }

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] overflow-hidden"
    >
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(184,134,11,0.15) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(184,134,11,0.1) 0%, transparent 50%)`
          }}
        />
      </div>

      {/* Gold Accent Lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B8860B]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B8860B]/30 to-transparent" />

      {/* Main Content Grid */}
      <div className="relative min-h-screen container mx-auto px-4 lg:px-8 py-8 lg:py-0">
        <div className="grid lg:grid-cols-12 min-h-screen items-center gap-4 lg:gap-8">
          
          {/* Left Side - Category Sidebar (Desktop) */}
          <div className="hidden lg:flex lg:col-span-2 flex-col gap-2 py-20">
            <p className="text-[#B8860B] text-xs font-medium tracking-widest uppercase mb-4">Categories</p>
            {sidebarCategories.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
              >
                <Link 
                  to={item.link}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-[#B8860B]/20"
                >
                  <span className="w-8 h-8 rounded-full bg-[#B8860B]/10 flex items-center justify-center text-sm">
                    {item.icon}
                  </span>
                  <span className="font-body text-sm text-white/70 group-hover:text-[#B8860B] transition-colors">
                    {item.name}
                  </span>
                  <ChevronRight className="w-3 h-3 text-white/30 group-hover:text-[#B8860B] ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Center - Product Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-24 lg:pt-0 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Decorative Ring */}
              <div className="absolute inset-0 -m-6 sm:-m-10 lg:-m-16">
                <div className="w-full h-full rounded-full border border-[#B8860B]/20" />
                <motion.div 
                  className="absolute inset-2 rounded-full border border-[#B8860B]/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Video/Image Container */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[380px] lg:h-[380px] rounded-full overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] shadow-[0_0_60px_rgba(184,134,11,0.15)]">
                {hasVideo ? (
                  <video
                    ref={videoRef}
                    className={`absolute inset-0 w-full h-full object-cover scale-125 transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
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
                ) : currentProduct ? (
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={currentProduct.id}
                      src={currentProduct.images[0] || currentBanner?.image_url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop"}
                      alt={currentProduct.name}
                      className="absolute inset-0 w-full h-full object-cover scale-110"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.6 }}
                    />
                  </AnimatePresence>
                ) : (
                  <img 
                    src={currentBanner?.image_url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop"}
                    alt="Featured Jewelry"
                    className="absolute inset-0 w-full h-full object-cover scale-110"
                  />
                )}

                {/* Loading State */}
                {hasVideo && !isVideoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D0D]">
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
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-100%', '100%'], opacity: [0, 0.3, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2 }}
                />
              </div>

              {/* Floating Sparkles */}
              <motion.div
                className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4"
                animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#B8860B]" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4"
                animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-2xl sm:text-3xl">💎</span>
              </motion.div>

              {/* Product Info Badge */}
              {currentProduct && !hasVideo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0D0D0D]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#B8860B]/20"
                >
                  <p className="text-white/90 text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">
                    {currentProduct.name}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Side - Text Content */}
          <div className="lg:col-span-5 flex flex-col justify-center pt-4 lg:pt-0 order-2 lg:order-3">
            <div className="space-y-5 lg:space-y-8 max-w-lg">
              
              {/* Animated Main Heading */}
              <div className="overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[200px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTextIndex}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight">
                      <span className="block font-light italic text-white/70">{currentText.title}</span>
                      <motion.span 
                        className="block mt-1 font-semibold bg-gradient-to-r from-[#B8860B] via-[#D4A84B] to-[#B8860B] bg-clip-text text-transparent"
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
              <div className="overflow-hidden min-h-[50px] sm:min-h-[60px]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentTextIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="font-body text-sm sm:text-base md:text-lg text-white/50 leading-relaxed"
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
                className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2"
              >
                <Link to="/shop">
                  <Button 
                    size="lg" 
                    className="group relative overflow-hidden px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-[#B8860B] to-[#9A7209] hover:from-[#D4A84B] hover:to-[#B8860B] text-white border-0 shadow-lg shadow-[#B8860B]/20 hover:shadow-xl hover:shadow-[#B8860B]/30 transition-all duration-500 rounded-full font-display tracking-wide text-sm sm:text-base"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Explore Collection
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        →
                      </motion.span>
                    </span>
                  </Button>
                </Link>

                <Link to="/collections" className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                  <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#B8860B] transition-colors">
                    <span className="text-xs">▶</span>
                  </span>
                  <span className="font-body text-xs sm:text-sm">View Story</span>
                </Link>
              </motion.div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-3 pt-4 sm:pt-6 border-t border-white/10"
              >
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#B8860B]" />
                  <span className="text-[10px] sm:text-xs font-medium text-white/60">925 Certified</span>
                </div>
                <span className="text-white/20">|</span>
                <p className="text-[10px] sm:text-xs text-white/40">
                  Authenticity & purity guaranteed
                </p>
              </motion.div>

              {/* Progress Indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-2 pt-2 sm:pt-4"
              >
                {defaultTexts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTextIndex(i)}
                    className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
                    style={{ width: i === currentTextIndex ? '40px' : '10px' }}
                    aria-label={`Go to slide ${i + 1}`}
                  >
                    <span className="absolute inset-0 bg-white/20" />
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
        </div>
      </div>

      {/* Mobile Category Pills */}
      <div className="lg:hidden absolute bottom-20 left-0 right-0 px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {sidebarCategories.slice(0, 4).map((item) => (
            <Link
              key={item.name}
              to={item.link}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs hover:bg-[#B8860B]/10 hover:border-[#B8860B]/30 transition-all"
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={scrollToContent}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 sm:gap-2 text-white/30 hover:text-white/60 transition-colors group"
      >
        <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em]">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
      </motion.button>

      {/* Rating Badge - Bottom Right (Desktop) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 right-8 hidden lg:flex items-center gap-3 bg-[#0D0D0D]/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10"
      >
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-[#B8860B]/20 border-2 border-[#0D0D0D] flex items-center justify-center text-[10px] text-white/60">
              {i}k
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3 h-3 fill-[#B8860B] text-[#B8860B]" />
            ))}
          </div>
          <p className="text-[10px] text-white/50">10k+ Happy Customers</p>
        </div>
      </motion.div>
    </section>
  );
};

export default LuxuryHeroSection;
