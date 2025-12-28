import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Save, 
  Loader2, 
  TrendingUp, 
  Star, 
  Package, 
  Crown,
  Image,
  Settings,
  Eye,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';
import ImageUpload from '@/components/admin/ImageUpload';
import { SEOHead } from '@/components/seo/SEOHead';

interface ProductPopupSettings {
  id: string;
  is_enabled: boolean;
  title: string;
  subtitle: string | null;
  theme_image: string | null;
  position: string;
  display_duration: number;
  show_on_pages: string[];
  auto_popup_delay: number;
  max_products: number;
  show_trending: boolean;
  show_new: boolean;
  show_bestseller: boolean;
  show_featured: boolean;
  selected_product_ids: string[];
  background_color: string;
  accent_color: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: any[];
  is_new: boolean;
  is_trending: boolean;
  is_bestseller: boolean;
  is_featured: boolean;
}

const AdminProductPopup = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<ProductPopupSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch settings
  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ['product-popup-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_popup_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as ProductPopupSettings | null;
    },
  });

  // Fetch feature toggle
  const { data: featureToggle } = useQuery({
    queryKey: ['feature-toggle-product-popup-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('*')
        .eq('feature_key', 'product_popup')
        .single();
      
      if (error && error.code !== 'PGRST116') return null;
      return data;
    },
  });

  // Fetch products for selection
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-popup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, price, images, is_new, is_trending, is_bestseller, is_featured')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    },
  });

  useEffect(() => {
    if (fetchedSettings) {
      setSettings(fetchedSettings);
      setSelectedProducts(fetchedSettings.selected_product_ids || []);
    }
  }, [fetchedSettings]);

  // Toggle feature
  const toggleFeatureMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!featureToggle?.id) return;
      const { error } = await supabase
        .from('feature_toggles')
        .update({ is_enabled: enabled })
        .eq('id', featureToggle.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-toggle-product-popup-admin'] });
      toast.success('Feature toggle updated');
    },
    onError: () => {
      toast.error('Failed to update feature toggle');
    },
  });

  // Save settings
  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('product_popup_settings')
        .update({
          ...settings,
          selected_product_ids: selectedProducts,
        })
        .eq('id', settings.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['product-popup-settings-admin'] });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Filter products by search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get products matching current filters
  const matchingProducts = products.filter(p => {
    if (selectedProducts.length > 0) {
      return selectedProducts.includes(p.id);
    }
    return (
      (settings?.show_trending && p.is_trending) ||
      (settings?.show_new && p.is_new) ||
      (settings?.show_bestseller && p.is_bestseller) ||
      (settings?.show_featured && p.is_featured)
    );
  }).slice(0, settings?.max_products || 4);

  if (isLoading) {
    return (
      <AdminSecurityWrapper>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminSecurityWrapper>
    );
  }

  return (
    <AdminSecurityWrapper>
      <SEOHead 
        title="Product Spotlight Popup Settings | Admin | NOIR925"
        description="Configure the product spotlight popup settings for your store."
        noIndex={true}
      />
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Product Spotlight Popup
            </h1>
            <p className="text-muted-foreground">
              Auto-display trending, new, and featured products to visitors
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </Button>
        </div>

        {/* Feature Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  featureToggle?.is_enabled ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                }`}>
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Enable Product Spotlight Popup</h3>
                  <p className="text-sm text-muted-foreground">
                    When enabled, the popup will appear automatically based on your settings
                  </p>
                </div>
              </div>
              <Switch
                checked={featureToggle?.is_enabled || false}
                onCheckedChange={(checked) => toggleFeatureMutation.mutate(checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Popup Title</Label>
                <Input
                  id="title"
                  value={settings?.title || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Trending Now"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={settings?.subtitle || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, subtitle: e.target.value } : null)}
                  placeholder="Discover our most loved pieces"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={settings?.position || 'right'}
                    onValueChange={(value) => setSettings(prev => prev ? { ...prev, position: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">Bottom Right</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="bottom">Bottom Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxProducts">Max Products</Label>
                  <Input
                    id="maxProducts"
                    type="number"
                    min="1"
                    max="10"
                    value={settings?.max_products || 4}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, max_products: parseInt(e.target.value) || 4 } : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delay">Show After (seconds)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="1"
                    max="60"
                    value={settings?.auto_popup_delay || 5}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, auto_popup_delay: parseInt(e.target.value) || 5 } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Auto-hide After (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="60"
                    value={settings?.display_duration || 10}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, display_duration: parseInt(e.target.value) || 10 } : null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Show on Pages</Label>
                <Input
                  value={settings?.show_on_pages?.join(', ') || ''}
                  onChange={(e) => {
                    const pages = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
                    setSettings(prev => prev ? { ...prev, show_on_pages: pages } : null);
                  }}
                  placeholder="home, shop, collections"
                />
                <p className="text-xs text-muted-foreground">Comma-separated page names</p>
              </div>

              <div className="space-y-2">
                <Label>Theme Image (Optional)</Label>
                <ImageUpload
                  value={settings?.theme_image ? [settings.theme_image] : []}
                  onChange={(urls) => setSettings(prev => prev ? { ...prev, theme_image: urls[0] || null } : null)}
                  maxFiles={1}
                  bucket="banner-images"
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Product Selection
              </CardTitle>
              <CardDescription>
                Choose which products to display. Select specific products OR use filters below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Trending</span>
                  </div>
                  <Switch
                    checked={settings?.show_trending || false}
                    onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, show_trending: checked } : null)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">New Arrivals</span>
                  </div>
                  <Switch
                    checked={settings?.show_new || false}
                    onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, show_new: checked } : null)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Bestsellers</span>
                  </div>
                  <Switch
                    checked={settings?.show_bestseller || false}
                    onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, show_bestseller: checked } : null)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Featured</span>
                  </div>
                  <Switch
                    checked={settings?.show_featured || false}
                    onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, show_featured: checked } : null)}
                  />
                </div>
              </div>

              {/* Search products */}
              <div className="space-y-2">
                <Label>Or Select Specific Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Product list */}
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                {filteredProducts.slice(0, 20).map((product) => {
                  const imageUrl = Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : 'https://via.placeholder.com/50';
                  
                  return (
                    <div
                      key={product.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedProducts.includes(product.id) ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                      />
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {product.is_new && <Badge variant="outline" className="text-[10px] px-1 py-0">New</Badge>}
                          {product.is_trending && <Badge variant="outline" className="text-[10px] px-1 py-0">Trending</Badge>}
                          {product.is_bestseller && <Badge variant="outline" className="text-[10px] px-1 py-0">Best</Badge>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedProducts.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedProducts.length} products selected
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Preview
            </CardTitle>
            <CardDescription>Products that will be shown in the popup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {matchingProducts.map((product) => {
                const imageUrl = Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : 'https://via.placeholder.com/150';
                
                return (
                  <div key={product.id} className="rounded-lg border overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex gap-1 mt-1">
                        {product.is_new && <Badge className="bg-green-500 text-[10px] px-1 py-0">New</Badge>}
                        {product.is_trending && <Badge className="bg-orange-500 text-[10px] px-1 py-0">Hot</Badge>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {matchingProducts.length === 0 && (
                <p className="col-span-4 text-center text-muted-foreground py-8">
                  No products match your current filter settings
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminProductPopup;
