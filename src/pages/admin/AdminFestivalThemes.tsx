import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Palette, Plus, Trash2, Loader2, Edit, Calendar, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface FestivalTheme {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  banner_image: string | null;
  logo_overlay: string | null;
  special_offer: string | null;
  discount_percent: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  show_floating_banner?: boolean;
  floating_banner_text?: string | null;
}

const AdminFestivalThemes = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<FestivalTheme | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primary_color: '#D4AF37',
    secondary_color: '#1a1a1a',
    accent_color: '#8B7355',
    background_color: '#0a0a0a',
    banner_image: '',
    logo_overlay: '',
    special_offer: '',
    discount_percent: 0,
    start_date: '',
    end_date: '',
    show_floating_banner: true,
    floating_banner_text: '',
  });

  const { data: themes, isLoading } = useQuery({
    queryKey: ['festival-themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('festival_themes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as FestivalTheme[];
    },
  });

  const createTheme = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('festival_themes').insert({
        ...data,
        discount_percent: data.discount_percent || null,
        banner_image: data.banner_image || null,
        logo_overlay: data.logo_overlay || null,
        special_offer: data.special_offer || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        show_floating_banner: data.show_floating_banner,
        floating_banner_text: data.floating_banner_text || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['festival-themes'] });
      toast.success('Theme created successfully');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error('Failed to create theme: ' + error.message),
  });

  const updateTheme = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FestivalTheme> }) => {
      const { error } = await supabase.from('festival_themes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['festival-themes'] });
      toast.success('Theme updated successfully');
      setDialogOpen(false);
      setEditingTheme(null);
      resetForm();
    },
    onError: (error) => toast.error('Failed to update theme: ' + error.message),
  });

  const deleteTheme = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('festival_themes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['festival-themes'] });
      toast.success('Theme deleted successfully');
    },
    onError: (error) => toast.error('Failed to delete theme: ' + error.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // Deactivate all other themes first if activating
      if (is_active) {
        await supabase.from('festival_themes').update({ is_active: false }).neq('id', id);
      }
      const { error } = await supabase.from('festival_themes').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['festival-themes'] });
      toast.success('Theme status updated');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      primary_color: '#D4AF37',
      secondary_color: '#1a1a1a',
      accent_color: '#8B7355',
      background_color: '#0a0a0a',
      banner_image: '',
      logo_overlay: '',
      special_offer: '',
      discount_percent: 0,
      start_date: '',
      end_date: '',
      show_floating_banner: true,
      floating_banner_text: '',
    });
  };

  const handleEdit = (theme: FestivalTheme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      slug: theme.slug,
      primary_color: theme.primary_color,
      secondary_color: theme.secondary_color,
      accent_color: theme.accent_color,
      background_color: theme.background_color,
      banner_image: theme.banner_image || '',
      logo_overlay: theme.logo_overlay || '',
      special_offer: theme.special_offer || '',
      discount_percent: theme.discount_percent || 0,
      start_date: theme.start_date?.split('T')[0] || '',
      end_date: theme.end_date?.split('T')[0] || '',
      show_floating_banner: theme.show_floating_banner ?? true,
      floating_banner_text: theme.floating_banner_text || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTheme) {
      updateTheme.mutate({ id: editingTheme.id, data: formData as any });
    } else {
      createTheme.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Festival Themes</h1>
          <p className="text-muted-foreground mt-1">Manage website themes for festivals & occasions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingTheme(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Theme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTheme ? 'Edit Theme' : 'Create New Theme'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Theme Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Diwali Theme"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="diwali-2024"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primary_color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="secondary_color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent_color">Accent</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="accent_color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background_color">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="background_color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Festival Banner Image
                </Label>
                <ImageUpload
                  bucket="banner-images"
                  value={formData.banner_image ? [formData.banner_image] : []}
                  onChange={(urls) => setFormData({ ...formData, banner_image: urls[0] || '' })}
                  aspectRatio="banner"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Logo Overlay Image
                </Label>
                <ImageUpload
                  bucket="banner-images"
                  value={formData.logo_overlay ? [formData.logo_overlay] : []}
                  onChange={(urls) => setFormData({ ...formData, logo_overlay: urls[0] || '' })}
                  aspectRatio="square"
                />
                <p className="text-xs text-muted-foreground">Optional: PNG with transparent background for overlay effects</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="special_offer">Special Offer Text</Label>
                  <Input
                    id="special_offer"
                    value={formData.special_offer}
                    onChange={(e) => setFormData({ ...formData, special_offer: e.target.value })}
                    placeholder="Diwali Special: Extra 10% OFF"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_percent">Discount %</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Floating Banner Settings */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_floating_banner">Show Floating Banner</Label>
                  <Switch
                    id="show_floating_banner"
                    checked={formData.show_floating_banner}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_floating_banner: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floating_banner_text">Floating Banner Text</Label>
                  <Input
                    id="floating_banner_text"
                    value={formData.floating_banner_text}
                    onChange={(e) => setFormData({ ...formData, floating_banner_text: e.target.value })}
                    placeholder="Limited Time: Extra 20% OFF!"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createTheme.isPending || updateTheme.isPending}>
                {(createTheme.isPending || updateTheme.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingTheme ? 'Update Theme' : 'Create Theme'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {themes?.map((theme) => (
          <Card key={theme.id} className={theme.is_active ? 'ring-2 ring-primary' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {theme.name}
                  </CardTitle>
                  <CardDescription>{theme.slug}</CardDescription>
                </div>
                <Switch
                  checked={theme.is_active}
                  onCheckedChange={(checked) => toggleActive.mutate({ id: theme.id, is_active: checked })}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: theme.primary_color }}
                  title="Primary"
                />
                <div 
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: theme.secondary_color }}
                  title="Secondary"
                />
                <div 
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: theme.accent_color }}
                  title="Accent"
                />
                <div 
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: theme.background_color }}
                  title="Background"
                />
              </div>

              {theme.special_offer && (
                <p className="text-sm text-primary">{theme.special_offer}</p>
              )}

              {(theme.start_date || theme.end_date) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {theme.start_date && new Date(theme.start_date).toLocaleDateString()}
                  {theme.start_date && theme.end_date && ' - '}
                  {theme.end_date && new Date(theme.end_date).toLocaleDateString()}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(theme)}>
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <a 
                  href={`/festival/${theme.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  View Page
                </a>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteTheme.mutate(theme.id)}
                  disabled={deleteTheme.isPending}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {themes?.length === 0 && (
        <Card className="p-12 text-center">
          <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No festival themes yet. Create one to get started!</p>
        </Card>
      )}
    </div>
  );
};

export default AdminFestivalThemes;
