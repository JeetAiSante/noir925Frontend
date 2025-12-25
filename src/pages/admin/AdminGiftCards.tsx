import { useState, useEffect } from 'react';
import { Gift, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GiftCardDenomination {
  id: string;
  amount: number;
  bonus_amount: number;
  is_active: boolean;
  sort_order: number;
}

const AdminGiftCards = () => {
  const [denominations, setDenominations] = useState<GiftCardDenomination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDenom, setEditingDenom] = useState<GiftCardDenomination | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    bonus_amount: 0,
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchDenominations();
  }, []);

  const fetchDenominations = async () => {
    const { data } = await supabase
      .from('gift_card_denominations')
      .select('*')
      .order('sort_order');
    
    if (data) {
      setDenominations(data.map(d => ({
        ...d,
        amount: Number(d.amount),
        bonus_amount: Number(d.bonus_amount),
      })));
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (denom?: GiftCardDenomination) => {
    if (denom) {
      setEditingDenom(denom);
      setFormData({
        amount: denom.amount,
        bonus_amount: denom.bonus_amount,
        is_active: denom.is_active,
        sort_order: denom.sort_order,
      });
    } else {
      setEditingDenom(null);
      setFormData({
        amount: 0,
        bonus_amount: 0,
        is_active: true,
        sort_order: denominations.length + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingDenom) {
      const { error } = await supabase
        .from('gift_card_denominations')
        .update(formData)
        .eq('id', editingDenom.id);
      
      if (error) {
        toast.error('Failed to update');
      } else {
        toast.success('Denomination updated');
        fetchDenominations();
      }
    } else {
      const { error } = await supabase
        .from('gift_card_denominations')
        .insert(formData);
      
      if (error) {
        toast.error('Failed to create');
      } else {
        toast.success('Denomination created');
        fetchDenominations();
      }
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('gift_card_denominations')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Denomination deleted');
      fetchDenominations();
    }
  };

  const handleToggle = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('gift_card_denominations')
      .update({ is_active: !currentValue })
      .eq('id', id);

    if (!error) {
      setDenominations(denominations.map(d => 
        d.id === id ? { ...d, is_active: !currentValue } : d
      ));
    }
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
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Gift Cards</h1>
          <p className="text-muted-foreground">Manage gift card denominations and bonuses</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Denomination
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Gift Card Denominations
          </CardTitle>
          <CardDescription>Configure available gift card values and bonus amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {denominations.map((denom) => (
              <div
                key={denom.id}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  denom.is_active ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-xl">₹{denom.amount.toLocaleString()}</p>
                    {denom.bonus_amount > 0 && (
                      <p className="text-sm text-green-500">+₹{denom.bonus_amount} bonus</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={denom.is_active}
                    onCheckedChange={() => handleToggle(denom.id, denom.is_active)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(denom)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(denom.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDenom ? 'Edit Denomination' : 'Add Denomination'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(f => ({ ...f, amount: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Bonus Amount (₹)</Label>
              <Input
                type="number"
                value={formData.bonus_amount}
                onChange={(e) => setFormData(f => ({ ...f, bonus_amount: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">Extra value customer receives</p>
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(f => ({ ...f, sort_order: parseInt(e.target.value) }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData(f => ({ ...f, is_active: v }))}
              />
              <Label>Active</Label>
            </div>
            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGiftCards;
