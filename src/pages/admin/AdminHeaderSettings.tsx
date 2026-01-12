import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from '@/hooks/useAdminData';
import { Grid3X3, LayoutGrid, Save, Eye, EyeOff, Gem, Crown, Sparkles, Gift, Heart, Star } from 'lucide-react';

const iconOptions = [
  { value: 'gem', label: 'Gem', icon: Gem },
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'gift', label: 'Gift', icon: Gift },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'star', label: 'Star', icon: Star },
];

const AdminHeaderSettings = () => {
  const queryClient = useQueryClient();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const [categoriesEnabled, setCategoriesEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gridSettings, setGridSettings] = useState({
    desktop: 4,
    tablet: 3,
    mobile: 2,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // Fetch feature toggles
    const { data: features } = await supabase
      .from('feature_toggles')
      .select('*')
      .eq('feature_key', 'header_categories');

    if (features) {
      const categoriesFeature = features.find(f => f.feature_key === 'header_categories');
      if (categoriesFeature) setCategoriesEnabled(categoriesFeature.is_enabled);
    }

    // Fetch grid settings
    const { data: gridData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'grid_columns_settings')
      .single();

    if (gridData?.value) {
      const val = gridData.value as { desktop: number; tablet: number; mobile: number };
      setGridSettings(val);
    }
  };

  const handleToggleFeature = async (featureKey: string, enabled: boolean) => {
    const { error } = await supabase
      .from('feature_toggles')
      .update({ is_enabled: enabled })
      .eq('feature_key', featureKey);

    if (error) {
      toast.error('Failed to update setting');
    } else {
      if (featureKey === 'header_categories') setCategoriesEnabled(enabled);
      toast.success('Setting updated');
    }
  };

  const handleUpdateCategory = async (categoryId: string, updates: { show_in_header?: boolean; header_sort_order?: number; header_icon?: string }) => {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId);

    if (error) {
      toast.error('Failed to update category');
    } else {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
    }
  };

  const handleSaveGridSettings = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'grid_columns_settings',
        value: gridSettings,
        category: 'layout',
        description: 'Product grid column settings for different screen sizes'
      }, { onConflict: 'key' });

    if (error) {
      toast.error('Failed to save grid settings');
    } else {
      toast.success('Grid settings saved');
    }
    setSaving(false);
  };

  if (categoriesLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl mb-2">Header & Layout Settings</h1>
        <p className="text-muted-foreground">Configure header components and product grid layouts</p>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="grid">Grid Layout</TabsTrigger>
        </TabsList>

        {/* Feature Toggles */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                Header Features
              </CardTitle>
              <CardDescription>Enable or disable header components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoriesEnabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                    <LayoutGrid className={`w-5 h-5 ${categoriesEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Header Categories</p>
                    <p className="text-sm text-muted-foreground">Show category navigation in header</p>
                  </div>
                </div>
                <Switch
                  checked={categoriesEnabled}
                  onCheckedChange={(checked) => handleToggleFeature('header_categories', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Header Categories Management */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                Header Categories
              </CardTitle>
              <CardDescription>Configure which categories appear in the header navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Button
                        variant={category.show_in_header ? "default" : "outline"}
                        size="icon"
                        className="shrink-0"
                        onClick={() => handleUpdateCategory(category.id, { show_in_header: !category.show_in_header })}
                      >
                        {category.show_in_header ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.product_count} products</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Icon</Label>
                        <Select
                          value={category.header_icon || 'gem'}
                          onValueChange={(value) => handleUpdateCategory(category.id, { header_icon: value })}
                        >
                          <SelectTrigger className="w-28 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <option.icon className="w-4 h-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Order</Label>
                        <Input
                          type="number"
                          className="w-16 h-9"
                          value={category.header_sort_order || 0}
                          onChange={(e) => handleUpdateCategory(category.id, { header_sort_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grid Layout Settings */}
        <TabsContent value="grid">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-primary" />
                Product Grid Columns
              </CardTitle>
              <CardDescription>Configure how many products appear per row on different devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">🖥️</span>
                    Desktop (1280px+)
                  </Label>
                  <Select
                    value={gridSettings.desktop.toString()}
                    onValueChange={(value) => setGridSettings({ ...gridSettings, desktop: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} columns</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">📱</span>
                    Tablet (768px - 1279px)
                  </Label>
                  <Select
                    value={gridSettings.tablet.toString()}
                    onValueChange={(value) => setGridSettings({ ...gridSettings, tablet: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} columns</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">📲</span>
                    Mobile (0 - 767px)
                  </Label>
                  <Select
                    value={gridSettings.mobile.toString()}
                    onValueChange={(value) => setGridSettings({ ...gridSettings, mobile: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} columns</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveGridSettings} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Grid Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminHeaderSettings;
