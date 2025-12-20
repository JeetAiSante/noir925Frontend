import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reviews = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    title: 'Absolutely Stunning Quality',
    review: 'The craftsmanship is beyond exceptional. I ordered a silver pendant for my mother, and she was moved to tears. The attention to detail is remarkable.',
    product: 'Royal Heritage Necklace',
    date: '2 weeks ago',
    verified: true,
  },
  {
    id: 2,
    name: 'Ananya Patel',
    location: 'Delhi',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    title: 'Perfect Wedding Gift',
    review: 'Bought a complete bridal set for my sister. The packaging was luxurious, and the pieces themselves are museum-worthy. Everyone at the wedding was asking about it!',
    product: 'Bridal Heritage Collection',
    date: '1 month ago',
    verified: true,
  },
  {
    id: 3,
    name: 'Meera Krishnan',
    location: 'Chennai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    rating: 5,
    title: 'Exceeded All Expectations',
    review: 'As someone who collects fine jewelry, I can confidently say NOIR925 offers unparalleled quality. The silver purity and design aesthetics are top-notch.',
    product: 'Floral Bloom Earrings',
    date: '3 weeks ago',
    verified: true,
  },
  {
    id: 4,
    name: 'Kavitha Reddy',
    location: 'Hyderabad',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    title: 'Heirloom Quality Pieces',
    review: 'These pieces will be passed down through generations. The traditional designs with modern touches make them timeless. Customer service was also exceptional.',
    product: 'Temple Tradition Bangles',
    date: '2 months ago',
    verified: true,
  },
];

const CustomerReviewsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-accent text-sm text-primary tracking-widest uppercase mb-2">
            Customer Love
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-accent text-accent" />
              ))}
            </div>
            <span className="font-body text-muted-foreground">
              4.9/5 from 2,500+ reviews
            </span>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 hidden md:flex z-10 rounded-full hover:bg-muted"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 hidden md:flex z-10 rounded-full hover:bg-muted"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Review Cards */}
          <div className="relative h-[400px] md:h-[350px]">
            {reviews.map((review, index) => {
              const offset = index - activeIndex;
              const isActive = index === activeIndex;
              
              return (
                <div
                  key={review.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    isActive
                      ? 'opacity-100 translate-x-0 scale-100 z-10'
                      : offset < 0
                      ? 'opacity-0 -translate-x-full scale-95 z-0'
                      : 'opacity-0 translate-x-full scale-95 z-0'
                  }`}
                >
                  <div className="glass-heavy rounded-2xl p-8 md:p-12 h-full">
                    {/* Quote Icon */}
                    <Quote className="w-12 h-12 text-primary/20 mb-6" />

                    {/* Review Content */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-1">
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

                      <h3 className="font-display text-xl md:text-2xl text-foreground">
                        "{review.title}"
                      </h3>

                      <p className="font-body text-muted-foreground leading-relaxed">
                        {review.review}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-4">
                          <img
                            src={review.avatar}
                            alt={review.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-display text-foreground flex items-center gap-2">
                              {review.name}
                              {review.verified && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  Verified
                                </span>
                              )}
                            </p>
                            <p className="font-body text-sm text-muted-foreground">
                              {review.location} • {review.date}
                            </p>
                          </div>
                        </div>
                        <div className="hidden md:block text-right">
                          <p className="font-body text-xs text-muted-foreground">Purchased</p>
                          <p className="font-display text-sm text-foreground">{review.product}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-border hover:bg-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewsCarousel;
