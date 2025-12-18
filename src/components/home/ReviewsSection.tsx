import { Star, Quote, MapPin, CheckCircle } from 'lucide-react';

const ReviewsSection = () => {
  const reviews = [
    {
      id: 1,
      name: 'Priya Sharma',
      location: 'Mumbai',
      rating: 5,
      review: 'The quality of NOIR925 jewellery is exceptional. I purchased the Lotus Bloom Ring for my engagement, and it exceeded all expectations. The craftsmanship is truly remarkable.',
      product: 'Lotus Bloom Ring',
      verified: true,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    {
      id: 2,
      name: 'Ananya Patel',
      location: 'Delhi',
      rating: 5,
      review: 'Absolutely love my Celestial Moon Ring! The attention to detail is incredible. The packaging was beautiful too - perfect for gifting.',
      product: 'Celestial Moon Ring',
      verified: true,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    {
      id: 3,
      name: 'Meera Reddy',
      location: 'Bangalore',
      rating: 5,
      review: 'Ordered the Heritage Chain Necklace for my mother\'s birthday. She was thrilled! The silver quality is genuine and the design is timeless.',
      product: 'Heritage Chain Necklace',
      verified: true,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    },
    {
      id: 4,
      name: 'Kavitha Nair',
      location: 'Chennai',
      rating: 5,
      review: 'The Butterfly Studs are so delicate and beautiful. I wear them every day and always get compliments. Fast delivery and great customer service!',
      product: 'Monarch Butterfly Studs',
      verified: true,
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-sm text-primary tracking-widest uppercase mb-2">
            Customer Love
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-accent text-accent" />
            ))}
            <span className="font-body text-lg text-foreground ml-2">4.9/5</span>
          </div>
          <p className="font-body text-muted-foreground">
            Based on 2,500+ verified reviews
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-background p-6 rounded-2xl shadow-soft hover:shadow-medium transition-shadow duration-300"
              data-cursor="card"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-primary/20 mb-4" />

              {/* Review Text */}
              <p className="font-body text-foreground/80 mb-6 line-clamp-4">
                "{review.review}"
              </p>

              {/* Product */}
              <p className="font-body text-xs text-primary uppercase tracking-wider mb-4">
                Purchased: {review.product}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'fill-accent text-accent' : 'text-border'
                    }`}
                  />
                ))}
              </div>

              {/* Reviewer Info */}
              <div className="flex items-center gap-3">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-foreground">{review.name}</p>
                    {review.verified && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="font-body text-xs">{review.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-12 border-t border-border">
          {[
            { number: '50K+', label: 'Happy Customers' },
            { number: '4.9', label: 'Average Rating' },
            { number: '99%', label: 'Satisfaction Rate' },
            { number: '15K+', label: '5-Star Reviews' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-4xl md:text-5xl text-primary mb-2">
                {stat.number}
              </p>
              <p className="font-body text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
