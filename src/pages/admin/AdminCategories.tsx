import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, FolderTree, Gem, Crown, Heart, Star, Diamond, CircleDot, Sparkles, Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories, Category } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import ImageUpload from '@/components/admin/ImageUpload';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';

// Jewelry-related icons for header categories
const headerIcons = [
  { value: 'gem', label: 'Gem', icon: Gem },
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'diamond', label: 'Diamond', icon: Diamond },
  { value: 'ring', label: 'Ring', icon: CircleDot },
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'flower', label: 'Flower', icon: Flower2 },
];

const getIconComponent = (iconValue: string | null) => {
  const iconItem = headerIcons.find(i => i.value === iconValue);
  return iconItem?.icon || Gem;
};

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    icon: '',
    is_active: true,
    is_featured: false,
    sort_order: 0,
    show_in_header: false,
    header_sort_order: 0,
    header_icon: '',
  });

  const filteredCategories = categories?.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      icon: '',
      is_active: true,
      is_featured: false,
      sort_order: 0,
      show_in_header: false,
      header_sort_order: 0,
      header_icon: '',
    });
    setEditingCategory(null);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      icon: category.icon || '',
      is_active: category.is_active,
      is_featured: category.is_featured,
      sort_order: category.sort_order,
      show_in_header: category.show_in_header || false,
      header_sort_order: category.header_sort_order || 0,
      header_icon: category.header_icon || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        image_url: formData.image_url || null,
        icon: formData.icon || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        sort_order: formData.sort_order,
        show_in_header: formData.show_in_header,
        header_sort_order: formData.header_sort_order,
        header_icon: formData.header_icon || null,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(dataToSubmit)
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(dataToSubmit);
        if (error) throw error;
        toast.success('Category created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsFormOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (isLoading) {
    return (
      <AdminSecurityWrapper>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminSecurityWrapper>
    );
  }

  return (
    <AdminSecurityWrapper>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl lg:text-3xl">Categories</h1>
              <p className="text-muted-foreground text-sm">{categories?.length || 0} categories</p>
            </div>
          </div>
          <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Image Upload */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Category Image</Label>
                  <ImageUpload
                    bucket="banner-images"
                    value={formData.image_url ? [formData.image_url] : []}
                    onChange={(urls) => setFormData({ ...formData, image_url: urls[0] || '' })}
                    maxFiles={1}
                  />
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: generateSlug(e.target.value)
                        });
                      }}
                      placeholder="Category name"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="category-slug"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Short description"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Sort Order</Label>
                    <Input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Status Switches */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                    <Label className="text-sm">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_featured} onCheckedChange={(c) => setFormData({ ...formData, is_featured: c })} />
                    <Label className="text-sm">Featured</Label>
                  </div>
                </div>

                {/* Header Navigation Section */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Header Navigation Settings
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={formData.show_in_header} 
                        onCheckedChange={(c) => setFormData({ ...formData, show_in_header: c })} 
                      />
                      <Label className="text-sm">Show in Header Navigation</Label>
                    </div>

                    {formData.show_in_header && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 border-l-2 border-primary/20">
                        <div className="space-y-1.5">
                          <Label className="text-sm">Header Icon</Label>
                          <Select
                            value={formData.header_icon}
                            onValueChange={(v) => setFormData({ ...formData, header_icon: v })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select icon">
                                {formData.header_icon && (
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const IconComp = getIconComponent(formData.header_icon);
                                      return <IconComp className="w-4 h-4" />;
                                    })()}
                                    <span className="capitalize">{formData.header_icon}</span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {headerIcons.map(({ value, label, icon: Icon }) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <span>{label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm">Header Sort Order</Label>
                          <Input
                            type="number"
                            value={formData.header_sort_order}
                            onChange={(e) => setFormData({ ...formData, header_sort_order: parseInt(e.target.value) || 0 })}
                            className="h-9"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3">
                  <Button variant="outline" className="flex-1 h-9" onClick={() => { setIsFormOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button className="flex-1 h-9" onClick={handleSubmit}>
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories?.map((category) => {
            const HeaderIcon = getIconComponent(category.header_icon);
            return (
              <Card key={category.id} className="group relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video relative bg-muted">
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderTree className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    {category.show_in_header && (
                      <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <HeaderIcon className="w-3 h-3" />
                        <span>Header</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <div className="flex gap-2">
                        <Button size="icon" variant="secondary" onClick={() => openEditForm(category)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(category.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">{category.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${category.is_active ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.product_count} products</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCategories?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No categories found
          </div>
        )}
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminCategories;
