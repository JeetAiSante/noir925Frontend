import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const ParallaxBanner = () => {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          setScrollY(window.scrollY);
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const banners = [
    {
      title: 'Monsoon Sale',
      subtitle: 'Up to 40% Off',
      description: 'Refresh your collection with stunning silver pieces',
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1920&h=600&fit=crop',
      link: '/shop?sale=monsoon',
      gradient: 'from-primary/90 via-primary/70 to-transparent',
    },
    {
      title: 'Wedding Season',
      subtitle: 'Bridal Collection',
      description: 'Timeless pieces for your special day',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&h=600&fit=crop',
      link: '/shop?category=bridal',
      gradient: 'from-secondary/90 via-secondary/70 to-transparent',
    },
  ];

  return (
    <section ref={sectionRef} className="py-8 md:py-16">
      <div className="container mx-auto px-4 space-y-6">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden group transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            {/* Parallax Background */}
            <div
              className="absolute inset-0 w-full h-[120%] -top-[10%] bg-cover bg-center transition-transform duration-100"
              style={{
                backgroundImage: `url(${banner.image})`,
                transform: `translateY(${(scrollY - (sectionRef.current?.offsetTop || 0)) * 0.1}px)`,
              }}
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
            
            {/* Content */}
            <div className="relative h-full flex items-center px-8 md:px-16">
              <div className="max-w-lg">
                <p className="font-accent text-sm md:text-base text-background/90 tracking-widest uppercase mb-2 animate-fade-in">
                  {banner.subtitle}
                </p>
                <h3 className="font-display text-4xl md:text-6xl text-background mb-4 group-hover:scale-105 transition-transform duration-500 origin-left">
                  {banner.title}
                </h3>
                <p className="font-body text-lg text-background/80 mb-6 max-w-md">
                  {banner.description}
                </p>
                <Link to={banner.link}>
                  <Button
                    variant="hero"
                    className="group/btn"
                  >
                    Shop Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Shimmer Effect on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shimmer" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ParallaxBanner;
