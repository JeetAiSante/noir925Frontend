import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Star, Search, MessageCircle, Trash2, Eye, Send, 
  ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Filter,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  content: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  is_verified_purchase: boolean;
  is_featured: boolean;
  is_approved: boolean;
  helpful_count: number;
  admin_reply: string | null;
  admin_reply_at: string | null;
  created_at: string;
  products?: { name: string; slug: string };
}

const AdminReviews = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, products(name, slug)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async (updates: { id: string; data: Partial<Review> }) => {
      const { error } = await supabase
        .from('product_reviews')
        .update(updates.data)
        .eq('id', updates.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review updated');
    },
    onError: () => toast.error('Failed to update review'),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review deleted');
      setSelectedReview(null);
    },
    onError: () => toast.error('Failed to delete review'),
  });

  const submitReply = () => {
    if (!selectedReview || !replyText.trim()) return;
    updateReviewMutation.mutate({
      id: selectedReview.id,
      data: { admin_reply: replyText, admin_reply_at: new Date().toISOString() },
    });
    setReplyText('');
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.reviewer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.products?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = filterRating === null || review.rating === filterRating;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !review.is_approved) ||
      (filterStatus === 'approved' && review.is_approved && !review.is_featured) ||
      (filterStatus === 'featured' && review.is_featured);
    return matchesSearch && matchesRating && matchesStatus;
  });

  // Analytics
  const totalReviews = reviews.length;
  const avgRating = totalReviews ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1) : '0';
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const neutralReviews = reviews.filter((r) => r.rating === 3).length;
  const negativeReviews = reviews.filter((r) => r.rating <= 2).length;
  const repliedReviews = reviews.filter((r) => r.admin_reply).length;

  const ratingData = [5, 4, 3, 2, 1].map((star) => ({
    rating: `${star} ★`,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const sentimentData = [
    { name: 'Positive', value: positiveReviews, color: '#22c55e' },
    { name: 'Neutral', value: neutralReviews, color: '#f59e0b' },
    { name: 'Negative', value: negativeReviews, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <AdminSecurityWrapper>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-display">Reviews Analytics</h1>
              <p className="text-muted-foreground">Manage and analyze customer reviews</p>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Rating</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-display text-primary">{avgRating}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn('w-3 h-3', s <= Number(avgRating) ? 'fill-accent text-accent' : 'text-border')} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-3xl font-display">{totalReviews}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Replied</p>
                <p className="text-3xl font-display text-green-600">{repliedReviews}</p>
                <p className="text-xs text-muted-foreground">{totalReviews - repliedReviews} not replied</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Sentiment</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{positiveReviews}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Minus className="w-4 h-4" />
                    <span className="text-sm font-medium">{neutralReviews}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-500">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium">{negativeReviews}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ratingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sentiment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {sentimentData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'featured'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status as any)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>

            <div className="flex gap-1">
              {[null, 5, 4, 3, 2, 1].map((rating) => (
                <Button
                  key={rating ?? 'all'}
                  variant={filterRating === rating ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterRating(rating)}
                >
                  {rating ? `${rating}★` : 'All'}
                </Button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id} className={cn(!review.is_approved && 'border-amber-500/50 bg-amber-50/50')}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.reviewer_avatar || undefined} />
                        <AvatarFallback>{review.reviewer_name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium">{review.reviewer_name}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={cn('w-3 h-3', s <= review.rating ? 'fill-accent text-accent' : 'text-border')} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </span>
                          {review.is_verified_purchase && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                          {review.is_featured && (
                            <Badge className="text-xs">Featured</Badge>
                          )}
                          {!review.is_approved && (
                            <Badge variant="destructive" className="text-xs">Pending</Badge>
                          )}
                        </div>

                        {review.products && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Product: <span className="text-foreground">{review.products.name}</span>
                          </p>
                        )}

                        {review.title && <p className="font-medium text-sm">{review.title}</p>}
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{review.content}</p>

                        {review.admin_reply && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                            <p className="text-xs font-medium mb-1">NOIR925 Response</p>
                            <p className="text-sm text-muted-foreground">{review.admin_reply}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review);
                            setReplyText(review.admin_reply || '');
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={review.is_approved}
                            onCheckedChange={(checked) =>
                              updateReviewMutation.mutate({ id: review.id, data: { is_approved: checked } })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredReviews.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reviews found</p>
                </div>
              )}
            </div>
          )}

          {/* Review Detail Dialog */}
          <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Review Details</DialogTitle>
              </DialogHeader>

              {selectedReview && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selectedReview.reviewer_avatar || undefined} />
                      <AvatarFallback>{selectedReview.reviewer_name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{selectedReview.reviewer_name}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn('w-4 h-4', s <= selectedReview.rating ? 'fill-accent text-accent' : 'text-border')} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedReview.created_at), 'MMMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {selectedReview.title && <h3 className="font-medium text-lg">{selectedReview.title}</h3>}
                  <p className="text-muted-foreground">{selectedReview.content}</p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Label>Approved</Label>
                      <Switch
                        checked={selectedReview.is_approved}
                        onCheckedChange={(checked) => {
                          updateReviewMutation.mutate({ id: selectedReview.id, data: { is_approved: checked } });
                          setSelectedReview({ ...selectedReview, is_approved: checked });
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Featured</Label>
                      <Switch
                        checked={selectedReview.is_featured}
                        onCheckedChange={(checked) => {
                          updateReviewMutation.mutate({ id: selectedReview.id, data: { is_featured: checked } });
                          setSelectedReview({ ...selectedReview, is_featured: checked });
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Verified</Label>
                      <Switch
                        checked={selectedReview.is_verified_purchase}
                        onCheckedChange={(checked) => {
                          updateReviewMutation.mutate({ id: selectedReview.id, data: { is_verified_purchase: checked } });
                          setSelectedReview({ ...selectedReview, is_verified_purchase: checked });
                        }}
                      />
                    </div>
                  </div>

                  {/* Reply */}
                  <div className="space-y-3">
                    <Label>Admin Reply</Label>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a response to this review..."
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button onClick={submitReply} disabled={!replyText.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        {selectedReview.admin_reply ? 'Update Reply' : 'Send Reply'}
                      </Button>
                      {selectedReview.admin_reply && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            updateReviewMutation.mutate({
                              id: selectedReview.id,
                              data: { admin_reply: null, admin_reply_at: null },
                            });
                            setReplyText('');
                          }}
                        >
                          Remove Reply
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this review?')) {
                          deleteReviewMutation.mutate(selectedReview.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Review
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminReviews;
