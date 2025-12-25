import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gift, Plus, Trash2, Loader2, Edit, Settings, History, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SpinWheelSettings {
  id: string;
  is_enabled: boolean;
  show_on_pages: string[];
  spins_per_day: number;
}

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

interface SpinHistory {
  id: string;
  user_id: string | null;
  session_id: string | null;
  prize_type: string;
  prize_value: string;
  coupon_code: string | null;
  is_redeemed: boolean;
  created_at: string;
}

const AdminSpinWheel = () => {
  const queryClient = useQueryClient();
  const [prizeDialogOpen, setPrizeDialogOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<SpinWheelPrize | null>(null);
  const [prizeForm, setPrizeForm] = useState({
    label: '',
    value: '',
    discount_percent: 0,
    color: '#D4AF37',
    weight: 10,
  });

  // Fetch settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['spin-wheel-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spin_wheel_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data as SpinWheelSettings;
    },
  });

  // Fetch prizes
  const { data: prizes, isLoading: prizesLoading } = useQuery({
    queryKey: ['spin-wheel-prizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spin_wheel_prizes')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as SpinWheelPrize[];
    },
  });

  // Fetch spin history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['spin-wheel-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spin_wheel_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as SpinHistory[];
    },
  });

  // Update settings
  const updateSettings = useMutation({
    mutationFn: async (data: Partial<SpinWheelSettings>) => {
      const { error } = await supabase
        .from('spin_wheel_settings')
        .update(data)
        .eq('id', settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spin-wheel-settings'] });
      toast.success('Settings updated');
    },
    onError: (error) => toast.error('Failed to update settings: ' + error.message),
  });

  // Create prize
  const createPrize = useMutation({
    mutationFn: async (data: typeof prizeForm) => {
      const { error } = await supabase.from('spin_wheel_prizes').insert({
        ...data,
        discount_percent: data.discount_percent || null,
        sort_order: (prizes?.length || 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spin-wheel-prizes'] });
      toast.success('Prize created');
      setPrizeDialogOpen(false);
      resetPrizeForm();
    },
    onError: (error) => toast.error('Failed to create prize: ' + error.message),
  });

  // Update prize
  const updatePrize = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SpinWheelPrize> }) => {
      const { error } = await supabase.from('spin_wheel_prizes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spin-wheel-prizes'] });
      toast.success('Prize updated');
      setPrizeDialogOpen(false);
      setEditingPrize(null);
      resetPrizeForm();
    },
    onError: (error) => toast.error('Failed to update prize: ' + error.message),
  });

  // Delete prize
  const deletePrize = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('spin_wheel_prizes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spin-wheel-prizes'] });
      toast.success('Prize deleted');
    },
    onError: (error) => toast.error('Failed to delete prize: ' + error.message),
  });

  const resetPrizeForm = () => {
    setPrizeForm({
      label: '',
      value: '',
      discount_percent: 0,
      color: '#D4AF37',
      weight: 10,
    });
  };

  const handleEditPrize = (prize: SpinWheelPrize) => {
    setEditingPrize(prize);
    setPrizeForm({
      label: prize.label,
      value: prize.value,
      discount_percent: prize.discount_percent || 0,
      color: prize.color,
      weight: prize.weight,
    });
    setPrizeDialogOpen(true);
  };

  const handleSubmitPrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrize) {
      updatePrize.mutate({ id: editingPrize.id, data: prizeForm as any });
    } else {
      createPrize.mutate(prizeForm);
    }
  };

  if (settingsLoading) {
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
          <h1 className="font-display text-2xl md:text-3xl">Spin Wheel</h1>
          <p className="text-muted-foreground mt-1">Manage spin wheel settings and prizes</p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="prizes" className="gap-2">
            <Trophy className="w-4 h-4" />
            Prizes
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spin Wheel Settings</CardTitle>
              <CardDescription>Control how the spin wheel appears and functions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Spin Wheel</Label>
                  <p className="text-sm text-muted-foreground">Show spin wheel popup on the website</p>
                </div>
                <Switch
                  checked={settings?.is_enabled}
                  onCheckedChange={(checked) => updateSettings.mutate({ is_enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Spins Per Day</Label>
                <Input
                  type="number"
                  value={settings?.spins_per_day || 1}
                  onChange={(e) => updateSettings.mutate({ spins_per_day: parseInt(e.target.value) || 1 })}
                  min={1}
                  max={10}
                  className="w-32"
                />
              </div>

              <div className="space-y-2">
                <Label>Show On Pages</Label>
                <div className="flex flex-wrap gap-2">
                  {['shop', 'collections', 'home', 'product'].map((page) => (
                    <Badge
                      key={page}
                      variant={settings?.show_on_pages?.includes(page) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = settings?.show_on_pages || [];
                        const updated = current.includes(page)
                          ? current.filter((p) => p !== page)
                          : [...current, page];
                        updateSettings.mutate({ show_on_pages: updated });
                      }}
                    >
                      {page}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prizes" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={prizeDialogOpen} onOpenChange={(open) => {
              setPrizeDialogOpen(open);
              if (!open) {
                setEditingPrize(null);
                resetPrizeForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Prize
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPrize ? 'Edit Prize' : 'Add New Prize'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitPrize} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="label">Label</Label>
                      <Input
                        id="label"
                        value={prizeForm.label}
                        onChange={(e) => setPrizeForm({ ...prizeForm, label: e.target.value })}
                        placeholder="10% OFF"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value">Coupon Code</Label>
                      <Input
                        id="value"
                        value={prizeForm.value}
                        onChange={(e) => setPrizeForm({ ...prizeForm, value: e.target.value })}
                        placeholder="SPIN10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount_percent">Discount %</Label>
                      <Input
                        id="discount_percent"
                        type="number"
                        value={prizeForm.discount_percent}
                        onChange={(e) => setPrizeForm({ ...prizeForm, discount_percent: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (Probability)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={prizeForm.weight}
                        onChange={(e) => setPrizeForm({ ...prizeForm, weight: parseInt(e.target.value) || 10 })}
                        min={1}
                        max={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="color"
                          value={prizeForm.color}
                          onChange={(e) => setPrizeForm({ ...prizeForm, color: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={prizeForm.color}
                          onChange={(e) => setPrizeForm({ ...prizeForm, color: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={createPrize.isPending || updatePrize.isPending}>
                    {(createPrize.isPending || updatePrize.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingPrize ? 'Update Prize' : 'Add Prize'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prizes?.map((prize) => (
              <Card key={prize.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: prize.color }}
                      />
                      <CardTitle className="text-lg">{prize.label}</CardTitle>
                    </div>
                    <Switch
                      checked={prize.is_active}
                      onCheckedChange={(checked) => updatePrize.mutate({ id: prize.id, data: { is_active: checked } })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Coupon:</span>
                    <Badge variant="outline">{prize.value}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>{prize.discount_percent ? `${prize.discount_percent}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weight:</span>
                    <span>{prize.weight}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditPrize(prize)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deletePrize.mutate(prize.id)}
                      disabled={deletePrize.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spin History</CardTitle>
              <CardDescription>Recent spins and prize redemptions</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Prize</TableHead>
                      <TableHead>Coupon Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User/Session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm">
                          {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.prize_type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.coupon_code || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_redeemed ? 'default' : 'secondary'}>
                            {item.is_redeemed ? 'Redeemed' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.user_id ? item.user_id.slice(0, 8) + '...' : item.session_id?.slice(0, 8) + '...'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {history?.length === 0 && (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No spin history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSpinWheel;
