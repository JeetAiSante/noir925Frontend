import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, Banner } from '@/hooks/useAdminData';

const positionLabels: Record<string, string> = {
  hero: 'Hero Section',
  promo: 'Promotional',
  category: 'Category Banner',
  sale: 'Sale Banner',
};

const AdminBanners = () => {
  const { data: banners, isLoading } = useBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    link: '',
    button_text: '',
    position: 'promo',
    is_active: true,
    sort_order: 0,
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.image_url) {
      toast.error("Please fill in title and image URL");
      return;
    }

    if (editingBanner) {
      updateBanner.mutate({ 
        id: editingBanner.id, 
        data: formData 
      });
    } else {
      createBanner.mutate(formData as any);
    }

    closeDialog();
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      link: '',
      button_text: '',
      position: 'promo',
      is_active: true,
      sort_order: 0,
    });
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url,
      link: banner.link || '',
      button_text: banner.button_text || '',
      position: banner.position,
      is_active: banner.is_active,
      sort_order: banner.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteBanner.mutate(id);
  };

  const toggleActive = (banner: Banner) => {
    updateBanner.mutate({ 
      id: banner.id, 
      data: { is_active: !banner.is_active } 
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Banners</h1>
          <p className="text-muted-foreground">Manage homepage and promotional banners</p>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Banner
        </Button>
      </div>

      {/* Banners Grid */}
      <div className="grid gap-4">
        {banners?.map((banner) => (
          <Card 
            key={banner.id} 
            className={`border-border/50 overflow-hidden ${!banner.is_active && 'opacity-60'}`}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Preview Image */}
              <div className="relative w-full lg:w-64 h-40 lg:h-auto">
                <img 
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
              </div>
              
              {/* Banner Info */}
              <CardContent className="flex-1 p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                        {positionLabels[banner.position] || banner.position}
                      </span>
                      {banner.is_active ? (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Visible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg">{banner.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{banner.subtitle}</p>
                    {banner.link && (
                      <div className="flex items-center gap-1 text-xs text-primary mt-2">
                        <LinkIcon className="w-3 h-3" />
                        {banner.link}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={banner.is_active}
                      onCheckedChange={() => toggleActive(banner)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {(!banners || banners.length === 0) && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No banners yet. Create your first banner.</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingBanner ? 'Edit Banner' : 'Add New Banner'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Summer Collection"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Up to 50% off on selected items"
                rows={2}
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
              {formData.image_url && (
                <img 
                  src={formData.image_url}
                  alt="Preview"
                  className="mt-2 w-full h-32 object-cover rounded-lg"
                />
              )}
            </div>
            <div>
              <Label>Link URL</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/shop?category=..."
              />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                placeholder="Shop Now"
              />
            </div>
            <div>
              <Label>Position</Label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              >
                {Object.entries(positionLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={createBanner.isPending || updateBanner.isPending}
            >
              {(createBanner.isPending || updateBanner.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingBanner ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBanners;
