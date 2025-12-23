import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck, MapPin, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reviews = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    rating: 5,
    title: 'Absolutely Stunning Quality',
    review: 'The craftsmanship is beyond exceptional. I ordered a silver pendant for my mother\'s birthday, and she was moved to tears when she saw it. The attention to detail is remarkable, and the silver quality is exactly as promised — pure 925 sterling.',
    product: 'Royal Heritage Necklace',
    productImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop',
    date: '2 weeks ago',
    verified: true,
    helpful: 124,
  },
  {
    id: 2,
    name: 'Ananya Patel',
    location: 'New Delhi',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    rating: 5,
    title: 'Perfect Wedding Gift',
    review: 'Bought a complete bridal set for my sister\'s wedding. The packaging was so luxurious that it felt like unboxing fine art. The pieces themselves are museum-worthy! Everyone at the wedding was asking about it. Highly recommend for special occasions.',
    product: 'Bridal Heritage Collection',
    productImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&h=100&fit=crop',
    date: '1 month ago',
    verified: true,
    helpful: 89,
  },
  {
    id: 3,
    name: 'Meera Krishnan',
    location: 'Chennai, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    rating: 5,
    title: 'Exceeded All Expectations',
    review: 'As someone who collects fine jewelry, I can confidently say NOIR925 offers unparalleled quality at this price point. The silver purity, finish, and design aesthetics are absolutely top-notch. I\'ve already placed three more orders!',
    product: 'Floral Bloom Earrings',
    productImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop',
    date: '3 weeks ago',
    verified: true,
    helpful: 156,
  },
  {
    id: 4,
    name: 'Kavitha Reddy',
    location: 'Hyderabad, Telangana',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    rating: 5,
    title: 'Heirloom Quality Pieces',
    review: 'These pieces will definitely be passed down through generations in my family. The traditional designs with modern touches make them timeless. The customer service team was also exceptional — they helped me choose the perfect size.',
    product: 'Temple Tradition Bangles',
    productImage: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=100&h=100&fit=crop',
    date: '2 months ago',
    verified: true,
    helpful: 203,
  },
  {
    id: 5,
    name: 'Sneha Gupta',
    location: 'Bangalore, Karnataka',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    rating: 5,
    title: 'Best Silver Jewelry Brand',
    review: 'I\'ve tried many silver jewelry brands, but NOIR925 stands out for its quality and craftsmanship. The designs are unique, the packaging is premium, and the delivery was super fast. This is now my go-to brand for all silver jewelry.',
    product: 'Celestial Moon Ring',
    productImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&h=100&fit=crop',
    date: '1 week ago',
    verified: true,
    helpful: 67,
  },
];

const stats = [
  { value: '50,000+', label: 'Happy Customers' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '99%', label: 'Satisfaction Rate' },
  { value: '15,000+', label: '5-Star Reviews' },
];

const PremiumReviewsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-muted/30 via-background to-muted/20 overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-accent text-sm text-accent tracking-widest uppercase">
              Customer Love
            </span>
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            What Our Customers Say
          </h2>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-accent text-accent" />
              ))}
            </div>
            <span className="font-display text-2xl text-foreground">4.9</span>
            <span className="text-muted-foreground font-body">
              from <span className="text-foreground font-semibold">15,000+</span> verified reviews
            </span>
          </div>
        </div>

        {/* Main Review Display */}
        <div 
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10 rounded-full w-12 h-12 bg-background shadow-lg hover:bg-muted hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10 rounded-full w-12 h-12 bg-background shadow-lg hover:bg-muted hidden md:flex"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Review Cards Container */}
          <div className="relative min-h-[500px] md:min-h-[400px]">
            {reviews.map((review, index) => {
              const isActive = index === activeIndex;
              
              return (
                <div
                  key={review.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    isActive
                      ? 'opacity-100 translate-x-0 scale-100 z-10'
                      : index < activeIndex
                      ? 'opacity-0 -translate-x-full scale-95 z-0'
                      : 'opacity-0 translate-x-full scale-95 z-0'
                  }`}
                >
                  <div className="bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden">
                    <div className="grid md:grid-cols-3 gap-0">
                      {/* Left: Author Info */}
                      <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:p-10 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border/50">
                        <div className="relative mb-4">
                          <img
                            src={review.avatar}
                            alt={review.name}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-4 ring-background shadow-lg"
                          />
                          {review.verified && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center ring-2 ring-background">
                              <BadgeCheck className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <h4 className="font-display text-xl text-foreground mb-1">
                          {review.name}
                        </h4>
                        
                        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                          <MapPin className="w-3 h-3" />
                          <span className="font-body">{review.location}</span>
                        </div>
                        
                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-accent text-accent'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        
                        {/* Product Badge */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background/80 backdrop-blur-sm">
                          <img
                            src={review.productImage}
                            alt={review.product}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="text-left">
                            <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3" /> Purchased
                            </p>
                            <p className="font-display text-sm text-foreground line-clamp-1">
                              {review.product}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Review Content */}
                      <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center relative">
                        <Quote className="absolute top-6 right-6 w-16 h-16 text-primary/10" />
                        
                        <h3 className="font-display text-2xl md:text-3xl text-foreground mb-6 pr-16">
                          "{review.title}"
                        </h3>
                        
                        <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
                          {review.review}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground font-body">
                              {review.date}
                            </span>
                            {review.verified && (
                              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                <BadgeCheck className="w-3 h-3" />
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-body">{review.helpful} found this helpful</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === activeIndex
                    ? 'w-10 bg-primary'
                    : 'w-2 bg-border hover:bg-muted-foreground'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-4 mt-6 md:hidden">
            <Button variant="outline" size="icon" onClick={goToPrev} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} className="rounded-full">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-colors group"
            >
              <p className="font-display text-3xl md:text-4xl text-primary group-hover:scale-105 transition-transform">
                {stat.value}
              </p>
              <p className="font-body text-sm text-muted-foreground mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 opacity-60">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <span className="font-body text-sm">All reviews verified</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <span className="font-body text-sm">Secure & trusted</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="font-body text-sm">Quality guaranteed</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumReviewsSection;
