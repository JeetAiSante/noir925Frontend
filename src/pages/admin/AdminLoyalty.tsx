import { useState, useEffect } from 'react';
import { Award, Settings, Save, Users, TrendingUp, Gift, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';

interface LoyaltySettings {
  id: string;
  is_enabled: boolean;
  points_per_rupee: number;
  points_value_per_rupee: number;
  min_points_to_redeem: number;
  max_discount_percent: number;
  welcome_bonus_points: number;
}

const AdminLoyalty = () => {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch settings - get the first (and only) row
      const { data: settingsData, error: settingsError } = await supabase
        .from('loyalty_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (settingsError) {
        console.error('Error fetching loyalty settings:', settingsError);
        // If no settings exist, create default
        if (settingsError.code === 'PGRST116') {
          const { data: newSettings, error: insertError } = await supabase
            .from('loyalty_settings')
            .insert({
              is_enabled: true,
              points_per_rupee: 1,
              points_value_per_rupee: 0.25,
              min_points_to_redeem: 100,
              max_discount_percent: 50,
              welcome_bonus_points: 0,
            })
            .select()
            .single();
          
          if (!insertError && newSettings) {
            setSettings({
              id: newSettings.id,
              is_enabled: newSettings.is_enabled,
              points_per_rupee: Number(newSettings.points_per_rupee),
              points_value_per_rupee: Number(newSettings.points_value_per_rupee),
              min_points_to_redeem: newSettings.min_points_to_redeem,
              max_discount_percent: newSettings.max_discount_percent,
              welcome_bonus_points: newSettings.welcome_bonus_points,
            });
          }
        }
      } else if (settingsData) {
        setSettings({
          id: settingsData.id,
          is_enabled: settingsData.is_enabled,
          points_per_rupee: Number(settingsData.points_per_rupee),
          points_value_per_rupee: Number(settingsData.points_value_per_rupee),
          min_points_to_redeem: settingsData.min_points_to_redeem,
          max_discount_percent: settingsData.max_discount_percent,
          welcome_bonus_points: settingsData.welcome_bonus_points,
        });
      }

      // Fetch stats
      const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('user_loyalty_points')
        .select('total_points, redeemed_points');
      
      if (!loyaltyError && loyaltyData) {
        setStats({
          totalMembers: loyaltyData.length,
          totalPointsIssued: loyaltyData.reduce((sum, u) => sum + (u.total_points || 0), 0),
          totalPointsRedeemed: loyaltyData.reduce((sum, u) => sum + (u.redeemed_points || 0), 0),
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load loyalty settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('loyalty_settings')
        .update({
          is_enabled: settings.is_enabled,
          points_per_rupee: settings.points_per_rupee,
          points_value_per_rupee: settings.points_value_per_rupee,
          min_points_to_redeem: settings.min_points_to_redeem,
          max_discount_percent: settings.max_discount_percent,
          welcome_bonus_points: settings.welcome_bonus_points,
        })
        .eq('id', settings.id);
      
      if (error) {
        console.error('Error saving settings:', error);
        toast.error('Failed to save settings: ' + error.message);
      } else {
        toast.success('Loyalty settings saved successfully');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof LoyaltySettings>(key: K, value: LoyaltySettings[K]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
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

  if (!settings) {
    return (
      <AdminSecurityWrapper>
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Failed to load loyalty settings</p>
          <Button onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </AdminSecurityWrapper>
    );
  }

  return (
    <AdminSecurityWrapper>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-3xl lg:text-4xl mb-1">Loyalty Program</h1>
              <p className="text-muted-foreground">Manage customer rewards and points</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Program Status</span>
              <Switch
                checked={settings.is_enabled}
                onCheckedChange={(v) => updateSetting('is_enabled', v)}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-display">{stats.totalMembers}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-display">{stats.totalPointsIssued.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Points Issued</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-3xl font-display">{stats.totalPointsRedeemed.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Points Redeemed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Program Settings
            </CardTitle>
            <CardDescription>Configure how customers earn and redeem points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Earning Rules
                </h3>
                <div className="space-y-2">
                  <Label>Points per ₹1 spent</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={settings.points_per_rupee}
                    onChange={(e) => updateSetting('points_per_rupee', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">e.g., 1 = earn 1 point per rupee</p>
                </div>
                <div className="space-y-2">
                  <Label>Welcome Bonus Points</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.welcome_bonus_points}
                    onChange={(e) => updateSetting('welcome_bonus_points', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Points awarded on signup</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Redemption Rules
                </h3>
                <div className="space-y-2">
                  <Label>Point Value (₹ per point)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.points_value_per_rupee}
                    onChange={(e) => updateSetting('points_value_per_rupee', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">e.g., 0.25 = 100 points = ₹25</p>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Points to Redeem</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.min_points_to_redeem}
                    onChange={(e) => updateSetting('min_points_to_redeem', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Discount % per Order</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.max_discount_percent}
                    onChange={(e) => updateSetting('max_discount_percent', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Maximum % of order that can be paid with points</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button variant="outline" onClick={fetchData} disabled={isLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminLoyalty;
