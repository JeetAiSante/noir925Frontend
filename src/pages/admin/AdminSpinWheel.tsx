import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gift, Trash2, Plus, RotateCcw, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SpinWheelPrize {
  id: string;
  label: string;
  value: string;
  discount_percent: number | null;
  color: string;
  weight: number;
  is_active: boolean;
  sort_order: number;
}

interface SpinWheelSettings {
  id: string;
  is_enabled: boolean;
  spins_per_day: number;
  show_on_pages: string[] | null;
}

interface SpinHistory {
  id: string;
  user_id: string | null;
  session_id: string | null;
  prize_type: string;
  prize_value: string;
  coupon_code: string | null;
  is_redeemed: boolean | null;
  created_at: string;
}

const AdminSpinWheel = () => {
  const [settings, setSettings] = useState<SpinWheelSettings | null>(null);
  const [prizes, setPrizes] = useState<SpinWheelPrize[]>([]);
  const [history, setHistory] = useState<SpinHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validityDays, setValidityDays] = useState(7);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch settings
      const { data: settingsData } = await supabase
        .from('spin_wheel_settings')
        .select('*')
        .single();

      if (settingsData) {
        setSettings(settingsData);
      }

      // Fetch prizes
      const { data: prizesData } = await supabase
        .from('spin_wheel_prizes')
        .select('*')
        .order('sort_order');

      if (prizesData) {
        setPrizes(prizesData);
      }

      // Fetch recent history
      const { data: historyData } = await supabase
        .from('spin_wheel_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (historyData) {
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load spin wheel data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('spin_wheel_settings')
        .update({
          is_enabled: settings.is_enabled,
          spins_per_day: settings.spins_per_day,
          show_on_pages: settings.show_on_pages,
        })
        .eq('id', settings.id);

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePrize = async (prizeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('spin_wheel_prizes')
        .update({ is_active: isActive })
        .eq('id', prizeId);

      if (error) throw error;
      setPrizes(prizes.map(p => p.id === prizeId ? { ...p, is_active: isActive } : p));
      toast.success('Prize updated');
    } catch (error) {
      toast.error('Failed to update prize');
    }
  };

  const handleResetUserSpins = async () => {
    try {
      // Clear today's spin history entries to allow users to spin again
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { error } = await supabase
        .from('spin_wheel_history')
        .delete()
        .gte('created_at', today.toISOString());

      if (error) throw error;
      toast.success('All user spins have been reset for today');
      fetchData();
    } catch (error) {
      toast.error('Failed to reset spins');
    }
  };

  const handleExpireOldCoupons = async () => {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - validityDays);

      // Mark old unredeemed coupons as expired by deleting them
      const { error } = await supabase
        .from('spin_wheel_history')
        .delete()
        .eq('is_redeemed', false)
        .lt('created_at', expiryDate.toISOString());

      if (error) throw error;
      toast.success(`Expired coupons older than ${validityDays} days removed`);
      fetchData();
    } catch (error) {
      toast.error('Failed to expire coupons');
    }
  };

  if (isLoading) {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display text-foreground">Spin & Win Management</h1>
            <p className="text-muted-foreground">Configure prizes, validity, and reset options</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleResetUserSpins}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Spins
            </Button>
          </div>
        </div>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              General Settings
            </CardTitle>
            <CardDescription>Enable or disable the spin wheel and set daily limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enable Spin Wheel</Label>
              <Switch
                id="enabled"
                checked={settings?.is_enabled ?? false}
                onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, is_enabled: checked } : null)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spins">Spins Per Day</Label>
                <Input
                  id="spins"
                  type="number"
                  min="1"
                  max="10"
                  value={settings?.spins_per_day ?? 1}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, spins_per_day: parseInt(e.target.value) || 1 } : null)}
                />
              </div>
              <div>
                <Label htmlFor="validity">Coupon Validity (Days)</Label>
                <Input
                  id="validity"
                  type="number"
                  min="1"
                  max="365"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value) || 7)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Settings
              </Button>
              <Button variant="destructive" onClick={handleExpireOldCoupons}>
                <Calendar className="w-4 h-4 mr-2" />
                Expire Old Coupons
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prizes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Prize Configuration</CardTitle>
            <CardDescription>Manage available prizes and their probability weights</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Discount %</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prizes.map((prize) => (
                  <TableRow key={prize.id}>
                    <TableCell className="font-medium">{prize.label}</TableCell>
                    <TableCell>{prize.value}</TableCell>
                    <TableCell>{prize.discount_percent ?? '-'}</TableCell>
                    <TableCell>{prize.weight}</TableCell>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: prize.color }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={prize.is_active}
                        onCheckedChange={(checked) => handleTogglePrize(prize.id, checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Spin History
            </CardTitle>
            <CardDescription>View recent spins and redemption status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Prize</TableHead>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.slice(0, 20).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell>{entry.prize_value}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {entry.coupon_code || '-'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.is_redeemed ? 'default' : 'secondary'}>
                        {entry.is_redeemed ? 'Redeemed' : 'Unused'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminSpinWheel;
