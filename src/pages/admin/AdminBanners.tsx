import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  EyeOff,
  GripVertical
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
import { toast } from '@/hooks/use-toast';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  position: 'hero' | 'promo' | 'category' | 'sale';
  isActive: boolean;
  order: number;
}

const initialBanners: Banner[] = [
  {
    id: '1',
    title: 'Monsoon Collection',
    subtitle: 'Up to 50% Off on Silver Jewellery',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=600&fit=crop',
    linkUrl: '/shop?sale=monsoon',
    position: 'hero',
    isActive: true,
    order: 1,
  },
  {
    id: '2',
    title: 'Bridal Collection',
    subtitle: 'Make your special day unforgettable',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=400&fit=crop',
    linkUrl: '/collections/bridal-heritage',
    position: 'promo',
    isActive: true,
    order: 2,
  },
  {
    id: '3',
    title: 'Flash Sale',
    subtitle: 'Limited time offers',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=400&fit=crop',
    linkUrl: '/shop?sale=flash',
    position: 'sale',
    isActive: false,
    order: 3,
  },
];

const positionLabels = {
  hero: 'Hero Section',
  promo: 'Promotional',
  category: 'Category Banner',
  sale: 'Sale Banner',
};

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    position: 'promo',
    isActive: true,
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.imageUrl) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and image URL",
        variant: "destructive",
      });
      return;
    }

    if (editingBanner) {
      setBanners(prev => prev.map(banner => 
        banner.id === editingBanner.id ? { ...banner, ...formData } as Banner : banner
      ));
      toast({ title: "Banner updated", description: "The banner has been updated successfully" });
    } else {
      const newBanner: Banner = {
        id: Date.now().toString(),
        order: banners.length + 1,
        ...formData as Banner,
      };
      setBanners(prev => [...prev, newBanner]);
      toast({ title: "Banner created", description: "New banner has been created" });
    }

    closeDialog();
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      position: 'promo',
      isActive: true,
    });
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBanners(prev => prev.filter(banner => banner.id !== id));
    toast({ title: "Banner deleted", description: "The banner has been removed" });
  };

  const toggleActive = (id: string) => {
    setBanners(prev => prev.map(banner => 
      banner.id === id ? { ...banner, isActive: !banner.isActive } : banner
    ));
  };

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
        {banners.map((banner) => (
          <Card 
            key={banner.id} 
            className={`border-border/50 overflow-hidden ${!banner.isActive && 'opacity-60'}`}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Preview Image */}
              <div className="relative w-full lg:w-64 h-40 lg:h-auto">
                <img 
                  src={banner.imageUrl}
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
                        {positionLabels[banner.position]}
                      </span>
                      {banner.isActive ? (
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
                    {banner.linkUrl && (
                      <div className="flex items-center gap-1 text-xs text-primary mt-2">
                        <LinkIcon className="w-3 h-3" />
                        {banner.linkUrl}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={banner.isActive}
                      onCheckedChange={() => toggleActive(banner.id)}
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

      {banners.length === 0 && (
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
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
              {formData.imageUrl && (
                <img 
                  src={formData.imageUrl}
                  alt="Preview"
                  className="mt-2 w-full h-32 object-cover rounded-lg"
                />
              )}
            </div>
            <div>
              <Label>Link URL</Label>
              <Input
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="/shop?category=..."
              />
            </div>
            <div>
              <Label>Position</Label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value as Banner['position'] })}
              >
                {Object.entries(positionLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingBanner ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBanners;