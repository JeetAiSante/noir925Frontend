import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar,
  Percent,
  Tag,
  ToggleRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Coupon {
  id: string;
  name: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const AdminSales = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_order_value: 0,
    max_discount_amount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('coupons').insert({
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description || null,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_value: data.min_order_value,
        max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
        usage_limit: data.usage_limit ? Number(data.usage_limit) : null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        is_active: data.is_active,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast({ title: 'Coupon created', description: 'New coupon has been created' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('coupons')
        .update({
          name: data.name,
          code: data.code.toUpperCase(),
          description: data.description || null,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          min_order_value: data.min_order_value,
          max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
          usage_limit: data.usage_limit ? Number(data.usage_limit) : null,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          is_active: data.is_active,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast({ title: 'Coupon updated', description: 'The coupon has been updated' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast({ title: 'Coupon deleted', description: 'The coupon has been removed' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_value: 0,
      max_discount_amount: '',
      usage_limit: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    setEditingCoupon(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value,
      max_discount_amount: coupon.max_discount_amount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
      is_active: coupon.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.discount_value) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeCoupons = coupons.filter(c => c.is_active);
  const percentageCoupons = coupons.filter(c => c.discount_type === 'percentage');
  const fixedCoupons = coupons.filter(c => c.discount_type === 'fixed');

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Sales & Offers</h1>
          <p className="text-muted-foreground">Manage promotional campaigns and discount codes</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <ToggleRight className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-display">{activeCoupons.length}</p>
                <p className="text-sm text-muted-foreground">Active Coupons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Percent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display">{percentageCoupons.length}</p>
                <p className="text-sm text-muted-foreground">Percentage Discounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Tag className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-display">{fixedCoupons.length}</p>
                <p className="text-sm text-muted-foreground">Fixed Discounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No coupons yet. Create your first coupon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className={`border-border/50 ${!coupon.is_active && 'opacity-60'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      coupon.discount_type === 'percentage' ? 'bg-primary/10' : 'bg-accent/10'
                    }`}>
                      {coupon.discount_type === 'percentage' ? (
                        <Percent className="w-6 h-6 text-primary" />
                      ) : (
                        <Tag className="w-6 h-6 text-accent" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-lg">{coupon.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="px-2 py-0.5 bg-muted rounded text-sm font-mono">
                          {coupon.code}
                        </span>
                        <span className="text-primary font-semibold">
                          {coupon.discount_type === 'percentage' 
                            ? `${coupon.discount_value}% OFF` 
                            : `₹${coupon.discount_value} OFF`}
                        </span>
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-muted-foreground mt-1">{coupon.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    {coupon.start_date && coupon.end_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(coupon.start_date), 'MMM d')} - {format(new Date(coupon.end_date), 'MMM d, yyyy')}
                      </div>
                    )}
                    {coupon.min_order_value > 0 && (
                      <span className="text-sm text-muted-foreground">
                        Min: ₹{coupon.min_order_value}
                      </span>
                    )}
                    {coupon.usage_limit && (
                      <span className="text-sm text-muted-foreground">
                        Used: {coupon.usage_count}/{coupon.usage_limit}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={coupon.is_active}
                        onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: coupon.id, is_active: checked })}
                      />
                      <span className="text-sm">{coupon.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Coupon Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Sale"
              />
            </div>
            <div>
              <Label>Promo Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SUMMER50"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Coupon description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  placeholder={formData.discount_type === 'percentage' ? '50' : '500'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Order Value</Label>
                <Input
                  type="number"
                  value={formData.min_order_value}
                  onChange={(e) => setFormData({ ...formData, min_order_value: Number(e.target.value) })}
                  placeholder="e.g., 2999"
                />
              </div>
              <div>
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div>
              <Label>Max Discount Amount (for %)</Label>
              <Input
                type="number"
                value={formData.max_discount_amount}
                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                placeholder="e.g., 500 (optional)"
              />
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
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editingCoupon ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSales;
