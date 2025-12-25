import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Gift, Clock, Hash } from 'lucide-react';

interface LuckyDiscount {
  id: string;
  name: string;
  description: string | null;
  lucky_numbers: number[];
  login_time_start: string | null;
  login_time_end: string | null;
  discount_percent: number;
  discount_code: string | null;
  min_order_value: number;
  max_discount_amount: number | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  usage_limit: number | null;
  usage_count: number;
}

const AdminLuckyDiscounts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<LuckyDiscount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lucky_numbers: '',
    login_time_start: '',
    login_time_end: '',
    discount_percent: 10,
    discount_code: '',
    min_order_value: 0,
    max_discount_amount: '',
    is_active: true,
  });

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['lucky-discounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lucky_number_discounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LuckyDiscount[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const luckyNumbers = data.lucky_numbers
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));

      const { error } = await supabase.from('lucky_number_discounts').insert({
        name: data.name,
        description: data.description || null,
        lucky_numbers: luckyNumbers,
        login_time_start: data.login_time_start || null,
        login_time_end: data.login_time_end || null,
        discount_percent: data.discount_percent,
        discount_code: data.discount_code || null,
        min_order_value: data.min_order_value,
        max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
        is_active: data.is_active,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lucky-discounts'] });
      toast({ title: 'Lucky discount created successfully' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error creating discount', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const luckyNumbers = data.lucky_numbers
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));

      const { error } = await supabase
        .from('lucky_number_discounts')
        .update({
          name: data.name,
          description: data.description || null,
          lucky_numbers: luckyNumbers,
          login_time_start: data.login_time_start || null,
          login_time_end: data.login_time_end || null,
          discount_percent: data.discount_percent,
          discount_code: data.discount_code || null,
          min_order_value: data.min_order_value,
          max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
          is_active: data.is_active,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lucky-discounts'] });
      toast({ title: 'Lucky discount updated successfully' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error updating discount', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lucky_number_discounts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lucky-discounts'] });
      toast({ title: 'Lucky discount deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting discount', description: error.message, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('lucky_number_discounts')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lucky-discounts'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      lucky_numbers: '',
      login_time_start: '',
      login_time_end: '',
      discount_percent: 10,
      discount_code: '',
      min_order_value: 0,
      max_discount_amount: '',
      is_active: true,
    });
    setEditingDiscount(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (discount: LuckyDiscount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      description: discount.description || '',
      lucky_numbers: discount.lucky_numbers.join(', '),
      login_time_start: discount.login_time_start || '',
      login_time_end: discount.login_time_end || '',
      discount_percent: discount.discount_percent,
      discount_code: discount.discount_code || '',
      min_order_value: discount.min_order_value,
      max_discount_amount: discount.max_discount_amount?.toString() || '',
      is_active: discount.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingDiscount) {
      updateMutation.mutate({ id: editingDiscount.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold">Lucky Number Discounts</h2>
          <p className="text-muted-foreground">Create discounts based on login time and lucky numbers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" /> Add Lucky Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDiscount ? 'Edit' : 'Create'} Lucky Discount</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Morning Lucky 7"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Login between 7-8 AM with lucky number 7"
                />
              </div>
              <div>
                <Label>Lucky Numbers (comma separated) *</Label>
                <Input
                  value={formData.lucky_numbers}
                  onChange={(e) => setFormData({ ...formData, lucky_numbers: e.target.value })}
                  placeholder="7, 77, 777"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Login Time Start</Label>
                  <Input
                    type="time"
                    value={formData.login_time_start}
                    onChange={(e) => setFormData({ ...formData, login_time_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Login Time End</Label>
                  <Input
                    type="time"
                    value={formData.login_time_end}
                    onChange={(e) => setFormData({ ...formData, login_time_end: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount %</Label>
                  <Input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Discount Code</Label>
                  <Input
                    value={formData.discount_code}
                    onChange={(e) => setFormData({ ...formData, discount_code: e.target.value })}
                    placeholder="LUCKY7AM"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Order Value</Label>
                  <Input
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Max Discount Amount</Label>
                  <Input
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.lucky_numbers}>
                {editingDiscount ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" /> Total Discounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Active Discounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts.filter(d => d.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4 text-secondary" /> Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts.reduce((sum, d) => sum + d.usage_count, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Lucky Numbers</TableHead>
                <TableHead>Time Window</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : discounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No lucky discounts yet. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{discount.name}</p>
                        {discount.description && (
                          <p className="text-xs text-muted-foreground">{discount.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {discount.lucky_numbers.map((num) => (
                          <span key={num} className="px-2 py-0.5 bg-primary/10 rounded text-xs font-medium">
                            {num}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {discount.login_time_start && discount.login_time_end ? (
                        <span className="text-sm">
                          {discount.login_time_start} - {discount.login_time_end}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Any time</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">{discount.discount_percent}%</span>
                    </TableCell>
                    <TableCell>
                      {discount.discount_code ? (
                        <code className="px-2 py-1 bg-muted rounded text-xs">{discount.discount_code}</code>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={discount.is_active}
                        onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: discount.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(discount)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(discount.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLuckyDiscounts;
