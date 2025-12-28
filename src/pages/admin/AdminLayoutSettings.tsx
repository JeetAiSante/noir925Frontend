import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, LayoutGrid, Monitor, Tablet, Smartphone, RotateCcw, Loader2 } from 'lucide-react';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';

interface LayoutSettings {
  productsPerRow: number;
  productsPerRowMobile: number;
  productsPerRowTablet: number;
  showLoyaltyBanner: boolean;
}

const AdminLayoutSettings = () => {
  const [settings, setSettings] = useState<LayoutSettings>({
    productsPerRow: 4,
    productsPerRowMobile: 2,
    productsPerRowTablet: 3,
    showLoyaltyBanner: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'layout_settings')
        .single();

      if (!error && data) {
        const value = data.value as Record<string, any>;
        setSettings({
          productsPerRow: value.productsPerRow ?? 4,
          productsPerRowMobile: value.productsPerRowMobile ?? 2,
          productsPerRowTablet: value.productsPerRowTablet ?? 3,
          showLoyaltyBanner: value.showLoyaltyBanner ?? true,
        });
        setSettingsId(data.id);
      } else {
        // Create default settings if not exists
        const settingsValue = {
          productsPerRow: settings.productsPerRow,
          productsPerRowMobile: settings.productsPerRowMobile,
          productsPerRowTablet: settings.productsPerRowTablet,
          showLoyaltyBanner: settings.showLoyaltyBanner,
        };
        const { data: newData, error: createError } = await supabase
          .from('site_settings')
          .insert([{
            key: 'layout_settings',
            value: settingsValue,
            category: 'layout',
            description: 'Product grid and layout settings',
          }])
          .select()
          .single();

        if (!createError && newData) {
          setSettingsId(newData.id);
        }
      }
    } catch (err) {
      console.error('Error fetching layout settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsValue = {
        productsPerRow: settings.productsPerRow,
        productsPerRowMobile: settings.productsPerRowMobile,
        productsPerRowTablet: settings.productsPerRowTablet,
        showLoyaltyBanner: settings.showLoyaltyBanner,
      };

      if (settingsId) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: settingsValue })
          .eq('id', settingsId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            key: 'layout_settings',
            value: settingsValue,
            category: 'layout',
            description: 'Product grid and layout settings',
          }]);

        if (error) throw error;
      }

      toast.success('Layout settings saved successfully');
    } catch (err) {
      console.error('Error saving layout settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      productsPerRow: 4,
      productsPerRowMobile: 2,
      productsPerRowTablet: 3,
      showLoyaltyBanner: true,
    });
    toast.info('Reset to defaults - click Save to apply');
  };

  if (loading) {
    return (
      <AdminSecurityWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminSecurityWrapper>
    );
  }

  return (
    <AdminSecurityWrapper>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl">Layout Settings</h1>
            <p className="text-muted-foreground mt-1">Control product grid and display settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Product Grid Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                Product Grid
              </CardTitle>
              <CardDescription>
                Control how many products appear per row on different devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Desktop */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <Label>Desktop (per row)</Label>
                  <span className="ml-auto font-mono text-sm bg-muted px-2 py-1 rounded">
                    {settings.productsPerRow}
                  </span>
                </div>
                <Slider
                  value={[settings.productsPerRow]}
                  onValueChange={([v]) => setSettings({ ...settings, productsPerRow: v })}
                  min={3}
                  max={6}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                </div>
              </div>

              {/* Tablet */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-muted-foreground" />
                  <Label>Tablet (per row)</Label>
                  <span className="ml-auto font-mono text-sm bg-muted px-2 py-1 rounded">
                    {settings.productsPerRowTablet}
                  </span>
                </div>
                <Slider
                  value={[settings.productsPerRowTablet]}
                  onValueChange={([v]) => setSettings({ ...settings, productsPerRowTablet: v })}
                  min={2}
                  max={4}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                </div>
              </div>

              {/* Mobile */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <Label>Mobile (per row)</Label>
                  <span className="ml-auto font-mono text-sm bg-muted px-2 py-1 rounded">
                    {settings.productsPerRowMobile}
                  </span>
                </div>
                <Slider
                  value={[settings.productsPerRowMobile]}
                  onValueChange={([v]) => setSettings({ ...settings, productsPerRowMobile: v })}
                  min={1}
                  max={3}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Success Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Order Success Banner</CardTitle>
              <CardDescription>
                Configure the congratulations banner shown after successful orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Loyalty Points Banner</Label>
                  <p className="text-xs text-muted-foreground">
                    Display earned loyalty points after order placement
                  </p>
                </div>
                <Switch
                  checked={settings.showLoyaltyBanner}
                  onCheckedChange={(v) => setSettings({ ...settings, showLoyaltyBanner: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Grid Preview</CardTitle>
              <CardDescription>Preview how products will appear on different devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Monitor className="w-4 h-4" /> Desktop Preview ({settings.productsPerRow} columns)
                  </p>
                  <div 
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${settings.productsPerRow}, 1fr)` }}
                  >
                    {Array.from({ length: settings.productsPerRow }).map((_, i) => (
                      <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                        Product {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Tablet className="w-4 h-4" /> Tablet ({settings.productsPerRowTablet} columns)
                    </p>
                    <div 
                      className="grid gap-2"
                      style={{ gridTemplateColumns: `repeat(${settings.productsPerRowTablet}, 1fr)` }}
                    >
                      {Array.from({ length: settings.productsPerRowTablet }).map((_, i) => (
                        <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" /> Mobile ({settings.productsPerRowMobile} columns)
                    </p>
                    <div 
                      className="grid gap-2"
                      style={{ gridTemplateColumns: `repeat(${settings.productsPerRowMobile}, 1fr)` }}
                    >
                      {Array.from({ length: settings.productsPerRowMobile }).map((_, i) => (
                        <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminLayoutSettings;
