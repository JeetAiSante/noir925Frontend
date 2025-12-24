import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  rating: number;
  title: string | null;
  content: string;
  is_verified_purchase: boolean;
  created_at: string;
}

const RandomReviewsCarousel = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRandomReviews = async () => {
      try {
        // Fetch random reviews with good ratings
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .gte('rating', 4)
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) throw error;

        // Shuffle the reviews for randomness
        const shuffled = (data || []).sort(() => Math.random() - 0.5);
        setReviews(shuffled);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomReviews();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('reviews-carousel');
    if (container) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-[320px] h-[200px] bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              Customer Love
            </span>
            <h2 className="font-display text-3xl md:text-4xl">
              What Our Customers Say
            </h2>
          </div>
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div
          id="reviews-carousel"
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex-shrink-0 w-[320px] md:w-[380px] snap-start"
            >
              <div className="bg-card border border-border/50 rounded-2xl p-6 h-full hover:shadow-luxury transition-all duration-500 relative group">
                {/* Quote Icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Title */}
                {review.title && (
                  <h4 className="font-medium mb-2 line-clamp-1">{review.title}</h4>
                )}

                {/* Content */}
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  "{review.content}"
                </p>

                {/* Reviewer */}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                    {review.reviewer_avatar ? (
                      <img
                        src={review.reviewer_avatar}
                        alt={review.reviewer_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-display text-lg">
                        {review.reviewer_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{review.reviewer_name}</p>
                    {review.is_verified_purchase && (
                      <span className="text-xs text-primary flex items-center gap-1">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RandomReviewsCarousel;
