import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Bell, Settings, Save, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDBProducts } from '@/hooks/useAdminData';

const AdminInventory = () => {
  const { data: products } = useDBProducts();
  const [settings, setSettings] = useState({
    low_stock_threshold: 10,
    critical_stock_threshold: 5,
    enable_low_stock_alerts: true,
    enable_reorder_notifications: true,
    reorder_email: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('inventory_settings').select('*').single();
    if (data) {
      setSettings({
        low_stock_threshold: data.low_stock_threshold,
        critical_stock_threshold: data.critical_stock_threshold,
        enable_low_stock_alerts: data.enable_low_stock_alerts,
        enable_reorder_notifications: data.enable_reorder_notifications,
        reorder_email: data.reorder_email || '',
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('inventory_settings')
      .update(settings)
      .not('id', 'is', null);
    
    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Inventory settings saved');
    }
    setIsSaving(false);
  };

  const lowStockProducts = products?.filter(p => 
    p.stock_quantity <= settings.low_stock_threshold && p.stock_quantity > settings.critical_stock_threshold
  ) || [];

  const criticalStockProducts = products?.filter(p => 
    p.stock_quantity <= settings.critical_stock_threshold
  ) || [];

  const outOfStockProducts = products?.filter(p => p.stock_quantity === 0) || [];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">Monitor stock levels and configure alerts</p>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-3xl font-display">{outOfStockProducts.length}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-3xl font-display">{criticalStockProducts.length}</p>
                <p className="text-sm text-muted-foreground">Critical Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-3xl font-display">{lowStockProducts.length}</p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Alert Settings
            </CardTitle>
            <CardDescription>Configure stock alert thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input
                  type="number"
                  value={settings.low_stock_threshold}
                  onChange={(e) => setSettings(s => ({ ...s, low_stock_threshold: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Critical Stock Threshold</Label>
                <Input
                  type="number"
                  value={settings.critical_stock_threshold}
                  onChange={(e) => setSettings(s => ({ ...s, critical_stock_threshold: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reorder Notification Email</Label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={settings.reorder_email}
                onChange={(e) => setSettings(s => ({ ...s, reorder_email: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Show alerts in dashboard</p>
              </div>
              <Switch
                checked={settings.enable_low_stock_alerts}
                onCheckedChange={(v) => setSettings(s => ({ ...s, enable_low_stock_alerts: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reorder Notifications</p>
                <p className="text-sm text-muted-foreground">Send email when stock is critical</p>
              </div>
              <Switch
                checked={settings.enable_reorder_notifications}
                onCheckedChange={(v) => setSettings(s => ({ ...s, enable_reorder_notifications: v }))}
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Stock Alerts
            </CardTitle>
            <CardDescription>Products requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {[...outOfStockProducts, ...criticalStockProducts, ...lowStockProducts].slice(0, 10).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={(product.images as string[])?.[0] || '/placeholder.svg'}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                    </div>
                  </div>
                  <Badge
                    variant={product.stock_quantity === 0 ? 'destructive' : product.stock_quantity <= settings.critical_stock_threshold ? 'destructive' : 'secondary'}
                  >
                    {product.stock_quantity} left
                  </Badge>
                </div>
              ))}
              {[...outOfStockProducts, ...criticalStockProducts, ...lowStockProducts].length === 0 && (
                <p className="text-center text-muted-foreground py-8">All products have healthy stock levels</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminInventory;
