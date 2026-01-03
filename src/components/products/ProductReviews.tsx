import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp, Camera, X, CheckCircle2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  is_verified_purchase: boolean;
  is_featured: boolean;
  helpful_count: number;
  admin_reply: string | null;
  admin_reply_at: string | null;
  created_at: string;
  images?: { id: string; image_url: string }[];
}

const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  // Check if productId is a valid UUID
  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Please login to submit a review');
      if (!content.trim()) throw new Error('Please write a review');
      
      // Validate that productId is a valid UUID before attempting database insert
      if (!isValidUUID(productId)) {
        throw new Error('Reviews are only available for products in our database. This product cannot receive reviews at this time.');
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      // Check if user has purchased this product (verified purchase)
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('id, orders!inner(user_id, status)')
        .eq('product_id', productId)
        .limit(1);
      
      const isVerifiedPurchase = orderItems && orderItems.length > 0;

      // Insert the review
      const reviewData = {
        product_id: productId,
        user_id: user.id,
        rating,
        title: title.trim() || null,
        content: content.trim(),
        reviewer_name: profile?.full_name || user.email?.split('@')[0] || 'Customer',
        reviewer_avatar: profile?.avatar_url || null,
        is_verified_purchase: isVerifiedPurchase,
        is_approved: true, // Auto-approve for now, admin can change later
        is_featured: false,
        helpful_count: 0,
      };

      const { data: review, error } = await supabase
        .from('product_reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) {
        console.error('Review insert error:', error);
        throw new Error(error.message || 'Failed to submit review');
      }

      // Upload images if any
      if (images.length > 0 && review) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${review.id}-${i}-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(`reviews/${fileName}`, file);

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(`reviews/${fileName}`);

            await supabase.from('review_images').insert({
              review_id: review.id,
              image_url: urlData.publicUrl,
              sort_order: i,
            });
          }
        }
      }

      // Update product reviews count and rating
      const { data: allReviews } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true);

      if (allReviews && allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await supabase
          .from('products')
          .update({ 
            rating: Math.round(avgRating * 10) / 10, 
            reviews_count: allReviews.length 
          })
          .eq('id', productId);
      }

      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      toast.success('Review submitted successfully! Thank you for your feedback.');
      setShowForm(false);
      setRating(5);
      setTitle('');
      setContent('');
      setImages([]);
    },
    onError: (error: any) => {
      console.error('Review submission error:', error);
      toast.error(error.message || 'Failed to submit review. Please try again.');
    },
  });

  const helpfulMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('product_reviews')
        .update({ helpful_count: reviews.find(r => r.id === reviewId)?.helpful_count || 0 + 1 })
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <section className="py-8 md:py-12 border-t border-border">
      <div className="mb-8">
        <h2 className="font-display text-2xl md:text-3xl mb-6">Customer Reviews</h2>

        {/* Rating Summary */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-display text-primary">{averageRating}</div>
              <div className="flex gap-1 mt-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-5 h-5',
                      star <= Math.round(Number(averageRating))
                        ? 'fill-accent text-accent'
                        : 'text-border'
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
            </div>

            <div className="flex-1 space-y-2">
              {ratingCounts.map(({ star, count, percentage }) => (
                <button
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                  className={cn(
                    'flex items-center gap-2 w-full group transition-colors',
                    filterRating === star && 'text-primary'
                  )}
                >
                  <span className="text-sm w-3">{star}</span>
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {user ? (
              <Button onClick={() => setShowForm(!showForm)} className="w-full md:w-auto">
                Write a Review
              </Button>
            ) : (
              <p className="text-muted-foreground text-sm">
                Please <a href="/auth" className="text-primary hover:underline">login</a> to write a review
              </p>
            )}
          </div>
        </div>

        {/* Review Form */}
        {showForm && (
          <Card className="mb-8">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-display text-lg">Write Your Review</h3>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Your Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          'w-8 h-8 transition-colors',
                          star <= (hoverRating || rating)
                            ? 'fill-accent text-accent'
                            : 'text-border'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>Review Title (Optional)</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>Your Review *</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Add Photos (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <img
                        src={URL.createObjectURL(img)}
                        alt=""
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Up to 5 images</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={!content.trim() || submitReviewMutation.isPending}
                >
                  {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Pills */}
        {filterRating && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilterRating(null)}
              className="gap-1"
            >
              {filterRating} Stars
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <Card key={review.id} className={cn(review.is_featured && 'ring-2 ring-primary/20')}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={review.reviewer_avatar || undefined} />
                      <AvatarFallback>{review.reviewer_name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{review.reviewer_name}</span>
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Purchase
                          </span>
                        )}
                        {review.is_featured && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'w-4 h-4',
                                star <= review.rating
                                  ? 'fill-accent text-accent'
                                  : 'text-border'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>

                      {review.title && (
                        <h4 className="font-medium mt-3">{review.title}</h4>
                      )}

                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {review.content}
                      </p>

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-4">
                          {review.images.map((img) => (
                            <img
                              key={img.id}
                              src={img.image_url}
                              alt="Review"
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </div>
                      )}

                      {/* Admin Reply */}
                      {review.admin_reply && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">NOIR925 Response</span>
                            {review.admin_reply_at && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(review.admin_reply_at), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{review.admin_reply}</p>
                        </div>
                      )}

                      {/* Helpful Button */}
                      <button
                        onClick={() => helpfulMutation.mutate(review.id)}
                        className="flex items-center gap-1.5 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful_count || 0})
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductReviews;
