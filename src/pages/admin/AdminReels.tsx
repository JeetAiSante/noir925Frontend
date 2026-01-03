import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, Video, Upload, X, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';

interface Reel {
  id: string;
  title: string;
  subtitle: string | null;
  video_url: string;
  thumbnail_url: string | null;
  linked_product_id: string | null;
  linked_product_name: string | null;
  linked_product_image: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  images: string[];
}

const SortableReelItem = ({ reel, onEdit, onDelete }: { reel: Reel; onEdit: (reel: Reel) => void; onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: reel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card border border-border rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-4">
      <button {...attributes} {...listeners} className="cursor-grab hover:text-primary touch-none">
        <GripVertical className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
      </button>
      
      <div className="w-12 h-16 md:w-16 md:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {reel.thumbnail_url ? (
          <img src={reel.thumbnail_url} alt={reel.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-4 h-4 md:w-6 md:h-6 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate text-sm md:text-base">{reel.title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground truncate">{reel.subtitle || 'No subtitle'}</p>
        <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
          <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full ${reel.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {reel.is_active ? 'Active' : 'Inactive'}
          </span>
          {reel.linked_product_name && (
            <span className="text-[10px] md:text-xs text-primary truncate max-w-[100px] md:max-w-none">
              {reel.linked_product_name}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => onEdit(reel)}>
          <Pencil className="w-3 h-3 md:w-4 md:h-4" />
        </Button>
        <Button variant="destructive" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => onDelete(reel.id)}>
          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
        </Button>
      </div>
    </div>
  );
};

const AdminReelsContent = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    video_url: '',
    thumbnail_url: '',
    linked_product_id: '',
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch reels
  const { data: reels = [], isLoading } = useQuery({
    queryKey: ['admin-reels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_reels')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Reel[];
    },
  });

  // Fetch products for linking
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products-for-reels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, images')
        .eq('is_active', true)
        .limit(100);
      
      if (error) throw error;
      return data as Product[];
    },
  });

  // Upload video file
  const handleVideoUpload = async (file: File) => {
    if (!file) return;
    
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error('Video file must be less than 100MB');
      return;
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload MP4, WebM, or MOV video files');
      return;
    }

    setIsUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `reel-${Date.now()}.${fileExt}`;
      const filePath = `reels/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, video_url: publicUrl }));
      toast.success('Video uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload video: ' + (error as Error).message);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Upload thumbnail file
  const handleThumbnailUpload = async (file: File) => {
    if (!file) return;
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Thumbnail must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload JPG, PNG, or WebP images');
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `thumb-${Date.now()}.${fileExt}`;
      const filePath = `reels/thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, thumbnail_url: publicUrl }));
      toast.success('Thumbnail uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload thumbnail: ' + (error as Error).message);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const linkedProduct = products.find(p => p.id === data.linked_product_id);
      const images = linkedProduct?.images as string[] | undefined;
      
      const payload = {
        title: data.title,
        subtitle: data.subtitle || null,
        video_url: data.video_url,
        thumbnail_url: data.thumbnail_url || null,
        linked_product_id: data.linked_product_id || null,
        linked_product_name: linkedProduct?.name || null,
        linked_product_image: images?.[0] || null,
        is_active: data.is_active,
      };

      if (data.id) {
        const { error } = await supabase
          .from('homepage_reels')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const maxOrder = reels.length > 0 ? Math.max(...reels.map(r => r.sort_order)) + 1 : 0;
        const { error } = await supabase
          .from('homepage_reels')
          .insert({ ...payload, sort_order: maxOrder });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reels'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-reels'] });
      toast.success(editingReel ? 'Reel updated successfully' : 'Reel created successfully');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Error saving reel: ' + (error as Error).message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('homepage_reels').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reels'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-reels'] });
      toast.success('Reel deleted successfully');
    },
    onError: (error) => {
      toast.error('Error deleting reel: ' + (error as Error).message);
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (orderedReels: Reel[]) => {
      const updates = orderedReels.map((reel, index) => ({
        id: reel.id,
        sort_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('homepage_reels')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reels'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-reels'] });
      toast.success('Order updated');
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = reels.findIndex(r => r.id === active.id);
      const newIndex = reels.findIndex(r => r.id === over.id);
      const newOrder = arrayMove(reels, oldIndex, newIndex);
      reorderMutation.mutate(newOrder);
    }
  };

  const handleEdit = (reel: Reel) => {
    setEditingReel(reel);
    setFormData({
      title: reel.title,
      subtitle: reel.subtitle || '',
      video_url: reel.video_url,
      thumbnail_url: reel.thumbnail_url || '',
      linked_product_id: reel.linked_product_id || '',
      is_active: reel.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReel(null);
    setFormData({
      title: '',
      subtitle: '',
      video_url: '',
      thumbnail_url: '',
      linked_product_id: '',
      is_active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url) {
      toast.error('Title and Video URL are required');
      return;
    }
    saveMutation.mutate({
      ...formData,
      id: editingReel?.id,
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-display text-foreground">Homepage Reels</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage video reels displayed on the homepage</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" onClick={() => { setEditingReel(null); setFormData({ title: '', subtitle: '', video_url: '', thumbnail_url: '', linked_product_id: '', is_active: true }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Reel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReel ? 'Edit Reel' : 'Add New Reel'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Every Hour is Diamond Hour"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="From business hours to blissful evenings..."
                />
              </div>

              {/* Video Upload Section */}
              <div className="space-y-2">
                <Label>Video *</Label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div 
                    onClick={() => !isUploadingVideo && videoInputRef.current?.click()}
                    className={`border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors ${isUploadingVideo ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                    />
                    {isUploadingVideo ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Uploading video...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload video (MP4, WebM, MOV - max 100MB)</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Or URL Input */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or paste URL</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  
                  <div className="relative">
                    <Input
                      id="video_url"
                      value={formData.video_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                      placeholder="https://example.com/video.mp4"
                      className="pr-8"
                    />
                    {formData.video_url && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Video Preview */}
                  {formData.video_url && (
                    <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                      <video 
                        src={formData.video_url} 
                        className="w-full h-full object-cover" 
                        controls 
                        muted
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Upload Section */}
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="space-y-3">
                  <div 
                    onClick={() => !isUploadingThumbnail && thumbnailInputRef.current?.click()}
                    className={`border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors ${isUploadingThumbnail ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
                    />
                    {isUploadingThumbnail ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload thumbnail (JPG, PNG, WebP - max 5MB)</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Input
                      id="thumbnail_url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                      placeholder="https://example.com/thumbnail.jpg"
                      className="pr-8"
                    />
                    {formData.thumbnail_url && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {formData.thumbnail_url && (
                    <div className="w-20 h-28 rounded-lg overflow-hidden bg-muted">
                      <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linked_product">Link to Product</Label>
                <select
                  id="linked_product"
                  value={formData.linked_product_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, linked_product_id: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">No product linked</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending || isUploadingVideo || isUploadingThumbnail}>
                  {saveMutation.isPending ? 'Saving...' : editingReel ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Reels Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first reel to display on the homepage
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Reel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={reels.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {reels.map((reel) => (
                <SortableReelItem
                  key={reel.id}
                  reel={reel}
                  onEdit={handleEdit}
                  onDelete={(id) => {
                    if (confirm('Are you sure you want to delete this reel?')) {
                      deleteMutation.mutate(id);
                    }
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

const AdminReels = () => (
  <AdminSecurityWrapper>
    <AdminReelsContent />
  </AdminSecurityWrapper>
);

export default AdminReels;