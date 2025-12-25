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
      className="relative min-h-screen overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          hsl(220 20% 6%) 0%, 
          hsl(220 18% 10%) 25%, 
          hsl(200 15% 8%) 50%, 
          hsl(220 20% 8%) 75%, 
          hsl(220 22% 5%) 100%)`
      }}
    >
      {/* Ultra Premium Multi-Layer Background */}
      <div className="absolute inset-0">
        {/* Primary Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 20% 40%, hsla(40, 50%, 45%, 0.08) 0%, transparent 60%),
                         radial-gradient(ellipse 60% 40% at 80% 60%, hsla(160, 35%, 30%, 0.06) 0%, transparent 50%),
                         radial-gradient(ellipse 100% 80% at 50% 100%, hsla(40, 45%, 40%, 0.05) 0%, transparent 40%)`
          }}
        />
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        {/* Vignette Effect */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at center, transparent 0%, hsla(220, 20%, 4%, 0.4) 100%)`
        }} />
      </div>

      {/* Luxury Gold Accent Lines */}
      <div className="absolute top-0 left-0 w-full h-px" style={{
        background: `linear-gradient(90deg, transparent 0%, hsla(40, 50%, 50%, 0.4) 50%, transparent 100%)`
      }} />
      <div className="absolute bottom-0 left-0 w-full h-px" style={{
        background: `linear-gradient(90deg, transparent 0%, hsla(40, 50%, 50%, 0.3) 50%, transparent 100%)`
      }} />
      
      {/* Side Accent Glows */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full opacity-20" style={{
        background: `radial-gradient(circle, hsla(40, 50%, 45%, 0.3) 0%, transparent 70%)`
      }} />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full opacity-15" style={{
        background: `radial-gradient(circle, hsla(160, 40%, 40%, 0.25) 0%, transparent 70%)`
      }} />

      {/* Main Content Grid */}
      <div className="relative min-h-screen container mx-auto px-4 lg:px-8 py-8 lg:py-0">
        <div className="grid lg:grid-cols-12 min-h-screen items-center gap-4 lg:gap-8">
          
          {/* Left Side - Category Sidebar (Desktop) */}
          <div className="hidden lg:flex lg:col-span-2 flex-col gap-2 py-20">
            <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'hsl(40, 50%, 55%)' }}>Categories</p>
            {sidebarCategories.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
              >
                <Link 
                  to={item.link}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 border border-transparent"
                  style={{ 
                    ['--hover-bg' as string]: 'hsla(40, 40%, 50%, 0.08)',
                    ['--hover-border' as string]: 'hsla(40, 50%, 55%, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsla(40, 40%, 50%, 0.08)';
                    e.currentTarget.style.borderColor = 'hsla(40, 50%, 55%, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: 'hsla(40, 50%, 50%, 0.12)' }}>
                    {item.icon}
                  </span>
                  <span className="font-body text-sm transition-colors" style={{ color: 'hsla(40, 20%, 85%, 0.7)' }}>
                    {item.name}
                  </span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all" style={{ color: 'hsla(40, 50%, 55%, 0.5)' }} />
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
                <div className="w-full h-full rounded-full" style={{ border: '1px solid hsla(40, 50%, 50%, 0.25)' }} />
                <motion.div 
                  className="absolute inset-2 rounded-full"
                  style={{ border: '1px solid hsla(40, 50%, 50%, 0.12)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Video/Image Container */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[380px] lg:h-[380px] rounded-full overflow-hidden" style={{
                background: 'linear-gradient(135deg, hsl(220, 18%, 12%) 0%, hsl(220, 20%, 6%) 100%)',
                boxShadow: '0 0 80px hsla(40, 50%, 45%, 0.15), 0 0 120px hsla(40, 50%, 45%, 0.08), inset 0 0 60px hsla(220, 20%, 4%, 0.5)'
              }}>
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
                      src={currentProduct.image || currentBanner?.image_url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop"}
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
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'hsl(220, 20%, 6%)' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-8 h-8" style={{ color: 'hsla(40, 50%, 50%, 0.4)' }} />
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
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'hsl(40, 55%, 55%)' }} />
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
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 backdrop-blur-md px-4 py-2 rounded-full"
                  style={{ 
                    backgroundColor: 'hsla(220, 20%, 6%, 0.9)', 
                    border: '1px solid hsla(40, 50%, 50%, 0.2)' 
                  }}
                >
                  <p className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]" style={{ color: 'hsla(40, 20%, 92%, 0.9)' }}>
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
                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight" style={{ color: 'hsl(40, 20%, 95%)' }}>
                      <span className="block font-light italic" style={{ color: 'hsla(40, 20%, 90%, 0.7)' }}>{currentText.title}</span>
                      <motion.span 
                        className="block mt-1 font-semibold bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(135deg, hsl(40, 55%, 55%) 0%, hsl(40, 60%, 68%) 50%, hsl(40, 55%, 55%) 100%)' }}
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
                    className="font-body text-sm sm:text-base md:text-lg leading-relaxed"
                    style={{ color: 'hsla(40, 15%, 75%, 0.55)' }}
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
                    className="group relative overflow-hidden px-6 sm:px-8 py-5 sm:py-6 border-0 transition-all duration-500 rounded-full font-display tracking-wide text-sm sm:text-base"
                    style={{
                      background: 'linear-gradient(135deg, hsl(40, 50%, 45%) 0%, hsl(40, 45%, 38%) 100%)',
                      color: 'hsl(220, 20%, 8%)',
                      boxShadow: '0 8px 32px hsla(40, 50%, 45%, 0.25), 0 0 0 1px hsla(40, 60%, 60%, 0.1) inset'
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-2 font-semibold">
                      Explore Collection
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        →
                      </motion.span>
                    </span>
                  </Button>
                </Link>

                <Link to="/collections" className="group flex items-center gap-2 transition-colors" style={{ color: 'hsla(40, 15%, 75%, 0.5)' }}>
                  <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors" style={{ border: '1px solid hsla(40, 30%, 60%, 0.2)' }}>
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
                className="flex items-center gap-3 pt-4 sm:pt-6"
                style={{ borderTop: '1px solid hsla(40, 30%, 50%, 0.12)' }}
              >
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'hsl(40, 55%, 55%)' }} />
                  <span className="text-[10px] sm:text-xs font-medium" style={{ color: 'hsla(40, 20%, 85%, 0.6)' }}>925 Certified</span>
                </div>
                <span style={{ color: 'hsla(40, 30%, 50%, 0.2)' }}>|</span>
                <p className="text-[10px] sm:text-xs" style={{ color: 'hsla(40, 15%, 75%, 0.4)' }}>
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
                    <span className="absolute inset-0" style={{ backgroundColor: 'hsla(40, 30%, 50%, 0.2)' }} />
                    {i === currentTextIndex && (
                      <motion.span
                        className="absolute inset-0 origin-left"
                        style={{ backgroundColor: 'hsl(40, 55%, 55%)' }}
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
