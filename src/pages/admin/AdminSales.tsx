import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar,
  Percent,
  Tag,
  Clock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface Sale {
  id: string;
  name: string;
  code: string;
  discount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  type: 'percentage' | 'fixed';
  minOrder?: number;
}

const initialSales: Sale[] = [
  {
    id: '1',
    name: 'Monsoon Sale',
    code: 'MONSOON50',
    discount: 50,
    startDate: '2024-07-01',
    endDate: '2024-08-31',
    isActive: true,
    type: 'percentage',
    minOrder: 2999,
  },
  {
    id: '2',
    name: 'Festive Season',
    code: 'FESTIVE30',
    discount: 30,
    startDate: '2024-10-01',
    endDate: '2024-11-30',
    isActive: true,
    type: 'percentage',
  },
  {
    id: '3',
    name: 'New Customer',
    code: 'NEW500',
    discount: 500,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    type: 'fixed',
    minOrder: 1999,
  },
];

const AdminSales = () => {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState<Partial<Sale>>({
    name: '',
    code: '',
    discount: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    type: 'percentage',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.discount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingSale) {
      setSales(prev => prev.map(sale => 
        sale.id === editingSale.id ? { ...sale, ...formData } as Sale : sale
      ));
      toast({ title: "Sale updated", description: "The sale has been updated successfully" });
    } else {
      const newSale: Sale = {
        id: Date.now().toString(),
        ...formData as Sale,
      };
      setSales(prev => [...prev, newSale]);
      toast({ title: "Sale created", description: "New sale has been created" });
    }

    setIsDialogOpen(false);
    setEditingSale(null);
    setFormData({
      name: '',
      code: '',
      discount: 0,
      startDate: '',
      endDate: '',
      isActive: true,
      type: 'percentage',
    });
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData(sale);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
    toast({ title: "Sale deleted", description: "The sale has been removed" });
  };

  const toggleActive = (id: string) => {
    setSales(prev => prev.map(sale => 
      sale.id === id ? { ...sale, isActive: !sale.isActive } : sale
    ));
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Sales & Offers</h1>
          <p className="text-muted-foreground">Manage promotional campaigns and discount codes</p>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Sale
        </Button>
      </div>

      {/* Active Promotions Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <ToggleRight className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-display">{sales.filter(s => s.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active Sales</p>
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
                <p className="text-2xl font-display">{sales.filter(s => s.type === 'percentage').length}</p>
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
                <p className="text-2xl font-display">{sales.filter(s => s.type === 'fixed').length}</p>
                <p className="text-sm text-muted-foreground">Fixed Discounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <div className="grid gap-4">
        {sales.map((sale) => (
          <Card key={sale.id} className={`border-border/50 ${!sale.isActive && 'opacity-60'}`}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    sale.type === 'percentage' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    {sale.type === 'percentage' ? (
                      <Percent className="w-6 h-6 text-primary" />
                    ) : (
                      <Tag className="w-6 h-6 text-accent" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-lg">{sale.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-2 py-0.5 bg-muted rounded text-sm font-mono">
                        {sale.code}
                      </span>
                      <span className="text-primary font-semibold">
                        {sale.type === 'percentage' ? `${sale.discount}% OFF` : `₹${sale.discount} OFF`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {sale.startDate} - {sale.endDate}
                  </div>
                  {sale.minOrder && (
                    <span className="text-sm text-muted-foreground">
                      Min: ₹{sale.minOrder}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={sale.isActive}
                      onCheckedChange={() => toggleActive(sale.id)}
                    />
                    <span className="text-sm">{sale.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(sale)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDelete(sale.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingSale ? 'Edit Sale' : 'Create New Sale'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Sale Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Sale"
              />
            </div>
            <div>
              <Label>Promo Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SUMMER50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  placeholder={formData.type === 'percentage' ? '50' : '500'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Minimum Order (optional)</Label>
              <Input
                type="number"
                value={formData.minOrder || ''}
                onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) || undefined })}
                placeholder="e.g., 2999"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingSale ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSales;