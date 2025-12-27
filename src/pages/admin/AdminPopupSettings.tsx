import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Gift, MapPin, Percent, Save, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';

interface PopupSetting {
  id: string;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  description: string | null;
}

const AdminPopupSettings = () => {
  const queryClient = useQueryClient();

  // Fetch popup-related feature toggles
  const { data: popupSettings = [], isLoading } = useQuery({
    queryKey: ['popup-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('*')
        .in('feature_key', [
          'location_popup',
          'discount_popup',
          'spin_wheel_popup',
          'first_time_popup',
          'exit_intent_popup',
          'newsletter_popup'
        ])
        .order('feature_name');
      
      if (error) throw error;
      return data as PopupSetting[];
    },
  });

  // Fetch spin wheel settings
  const { data: spinSettings } = useQuery({
    queryKey: ['spin-wheel-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spin_wheel_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase
        .from('feature_toggles')
        .update({ is_enabled: value })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popup-settings'] });
      toast.success('Popup setting updated');
    },
    onError: () => {
      toast.error('Failed to update setting');
    },
  });

  const updateSpinSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<typeof spinSettings>) => {
      const { error } = await supabase
        .from('spin_wheel_settings')
        .update(settings)
        .eq('id', spinSettings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spin-wheel-settings'] });
      toast.success('Spin wheel settings updated');
    },
    onError: () => {
      toast.error('Failed to update spin wheel settings');
    },
  });

  const getPopupIcon = (key: string) => {
    switch (key) {
      case 'location_popup': return <MapPin className="w-5 h-5" />;
      case 'discount_popup': return <Percent className="w-5 h-5" />;
      case 'spin_wheel_popup': return <Gift className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

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
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Popup Management</h1>
          <p className="text-muted-foreground">Control popups and promotional overlays</p>
        </div>

        {/* Popup Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Popup Controls</CardTitle>
            <CardDescription>Enable or disable different popups on your website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {popupSettings.map((popup) => (
              <div
                key={popup.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    popup.is_enabled ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                  }`}>
                    {getPopupIcon(popup.feature_key)}
                  </div>
                  <div>
                    <p className="font-medium">{popup.feature_name}</p>
                    <p className="text-sm text-muted-foreground">{popup.description}</p>
                  </div>
                </div>
                <Switch
                  checked={popup.is_enabled}
                  onCheckedChange={(checked) => toggleMutation.mutate({ id: popup.id, value: checked })}
                />
              </div>
            ))}
            
            {popupSettings.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No popup settings found. Add feature toggles for popups in the database.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Spin Wheel Configuration */}
        {spinSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Spin Wheel Configuration
              </CardTitle>
              <CardDescription>Configure spin wheel behavior and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Spins Per Day</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    defaultValue={spinSettings.spins_per_day}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value > 0 && value <= 10) {
                        updateSpinSettingsMutation.mutate({ spins_per_day: value });
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">How many times a user can spin per day</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Show on Pages</Label>
                  <Input
                    defaultValue={spinSettings.show_on_pages?.join(', ')}
                    placeholder="shop, collections, home"
                    onChange={(e) => {
                      const pages = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
                      updateSpinSettingsMutation.mutate({ show_on_pages: pages });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated page names</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <p className="font-medium">Enable Spin Wheel</p>
                  <p className="text-sm text-muted-foreground">Show spin wheel to visitors</p>
                </div>
                <Switch
                  checked={spinSettings.is_enabled}
                  onCheckedChange={(checked) => updateSpinSettingsMutation.mutate({ is_enabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <MapPin className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-medium mb-1">Location Popup</h3>
              <p className="text-sm text-muted-foreground">
                Shows for first-time visitors to detect their location for currency and shipping.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <Percent className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-medium mb-1">Discount Popup</h3>
              <p className="text-sm text-muted-foreground">
                Shows after user scrolls to encourage newsletter subscription with a discount offer.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <Gift className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="font-medium mb-1">Spin Wheel</h3>
              <p className="text-sm text-muted-foreground">
                Gamified popup where users can spin to win discounts. Requires login.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminPopupSettings;
