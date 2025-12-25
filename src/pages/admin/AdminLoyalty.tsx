import { useState, useEffect } from 'react';
import { Award, Settings, Save, Users, TrendingUp, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminLoyalty = () => {
  const [settings, setSettings] = useState({
    is_enabled: true,
    points_per_rupee: 1,
    points_value_per_rupee: 0.25,
    min_points_to_redeem: 100,
    max_discount_percent: 50,
    welcome_bonus_points: 0,
  });
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
    // Fetch settings
    const { data: settingsData } = await supabase.from('loyalty_settings').select('*').single();
    if (settingsData) {
      setSettings({
        is_enabled: settingsData.is_enabled,
        points_per_rupee: Number(settingsData.points_per_rupee),
        points_value_per_rupee: Number(settingsData.points_value_per_rupee),
        min_points_to_redeem: settingsData.min_points_to_redeem,
        max_discount_percent: settingsData.max_discount_percent,
        welcome_bonus_points: settingsData.welcome_bonus_points,
      });
    }

    // Fetch stats
    const { data: loyaltyData } = await supabase.from('user_loyalty_points').select('total_points, redeemed_points');
    if (loyaltyData) {
      setStats({
        totalMembers: loyaltyData.length,
        totalPointsIssued: loyaltyData.reduce((sum, u) => sum + u.total_points, 0),
        totalPointsRedeemed: loyaltyData.reduce((sum, u) => sum + u.redeemed_points, 0),
      });
    }

    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('loyalty_settings')
      .update(settings)
      .not('id', 'is', null);
    
    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Loyalty settings saved');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Loyalty Program</h1>
          <p className="text-muted-foreground">Manage customer rewards and points</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Program Status</span>
          <Switch
            checked={settings.is_enabled}
            onCheckedChange={(v) => setSettings(s => ({ ...s, is_enabled: v }))}
          />
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
                  value={settings.points_per_rupee}
                  onChange={(e) => setSettings(s => ({ ...s, points_per_rupee: parseFloat(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">e.g., 1 = earn 1 point per rupee</p>
              </div>
              <div className="space-y-2">
                <Label>Welcome Bonus Points</Label>
                <Input
                  type="number"
                  value={settings.welcome_bonus_points}
                  onChange={(e) => setSettings(s => ({ ...s, welcome_bonus_points: parseInt(e.target.value) }))}
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
                  value={settings.points_value_per_rupee}
                  onChange={(e) => setSettings(s => ({ ...s, points_value_per_rupee: parseFloat(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">e.g., 0.25 = 100 points = ₹25</p>
              </div>
              <div className="space-y-2">
                <Label>Minimum Points to Redeem</Label>
                <Input
                  type="number"
                  value={settings.min_points_to_redeem}
                  onChange={(e) => setSettings(s => ({ ...s, min_points_to_redeem: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Discount % per Order</Label>
                <Input
                  type="number"
                  value={settings.max_discount_percent}
                  onChange={(e) => setSettings(s => ({ ...s, max_discount_percent: parseInt(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">Maximum % of order that can be paid with points</p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoyalty;
