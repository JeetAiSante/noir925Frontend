import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&h=1200&fit=crop',
    title: 'The Silversmith\'s Legacy',
    description: 'Three generations of master craftsmen continue the tradition of handcrafting pure 925 silver into wearable art.',
    category: 'Featured Story',
  },
  {
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&h=1200&fit=crop',
    title: 'Ethical Sourcing',
    description: 'We source only certified, conflict-free silver from responsible suppliers around the world.',
    category: 'Sustainability',
  },
  {
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&h=1200&fit=crop',
    title: 'BIS Hallmarked',
    description: 'Every piece is certified for purity by the Bureau of Indian Standards, guaranteeing 92.5% pure silver.',
    category: 'Certification',
  },
];

const LuxuryEditorialSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="py-12 md:py-16 bg-foreground text-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Editorial Header */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-center mb-10">
          <div>
            <span className="font-accent text-xs tracking-[0.2em] text-accent uppercase mb-2 block">The Art of Silver</span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight">
              Where Tradition
              <br />
              <span className="text-accent italic">Meets Modernity</span>
            </h2>
          </div>
          <div className="relative">
            <Quote className="w-8 h-8 text-accent/30 absolute -top-4 -left-2" />
            <p className="font-body text-base md:text-lg text-background/70 leading-relaxed pl-6">
              Each piece in our collection tells a story of centuries-old craftsmanship reimagined for the contemporary soul.
            </p>
          </div>
        </div>

        {/* Editorial Grid - Responsive */}
        <div className="grid md:grid-cols-5 gap-4">
          {/* Large Feature with Auto-shuffle */}
          <div 
            className="md:col-span-3 relative group overflow-hidden rounded-xl aspect-[4/5] md:aspect-auto md:h-[450px]"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                <img 
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
              <span className="font-accent text-[10px] tracking-[0.15em] text-accent uppercase">
                {slides[currentSlide].category}
              </span>
              <h3 className="font-display text-xl md:text-2xl text-background mt-1 mb-2">
                {slides[currentSlide].title}
              </h3>
              <p className="font-body text-sm text-background/70 mb-4 max-w-sm line-clamp-2">
                {slides[currentSlide].description}
              </p>
              <Link to="/about">
                <Button variant="hero-outline" size="sm" className="group/btn">
                  Read More
                  <ArrowRight className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-5 right-5 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="w-8 h-8 rounded-full bg-background/10 hover:bg-background/20 text-background"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="w-8 h-8 rounded-full bg-background/10 hover:bg-background/20 text-background"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setCurrentSlide(index); setIsAutoPlaying(false); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentSlide ? 'bg-accent w-4' : 'bg-background/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Small Features - Stack on mobile */}
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-1 gap-4">
            <Link to="/about#sustainability" className="relative group overflow-hidden rounded-xl aspect-square md:aspect-auto md:h-[215px]">
              <img 
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop"
                alt="Sustainable Silver"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="font-accent text-[10px] tracking-[0.15em] text-accent uppercase">Sustainability</span>
                <h4 className="font-display text-base md:text-lg text-background mt-0.5">Ethical Sourcing</h4>
              </div>
            </Link>

            <Link to="/about#certification" className="relative group overflow-hidden rounded-xl aspect-square md:aspect-auto md:h-[215px]">
              <img 
                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop"
                alt="Hallmark Certified"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="font-accent text-[10px] tracking-[0.15em] text-accent uppercase">Certification</span>
                <h4 className="font-display text-base md:text-lg text-background mt-0.5">BIS Hallmarked</h4>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LuxuryEditorialSection;