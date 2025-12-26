import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Truck, Award, RotateCcw, CreditCard, Zap, Plus, Trash2, Save, Loader2, GripVertical, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrustBadge {
  id: string;
  icon: string;
  title: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

const iconOptions = [
  { value: 'Truck', label: 'Truck (Shipping)', icon: Truck },
  { value: 'Shield', label: 'Shield (Security)', icon: Shield },
  { value: 'Award', label: 'Award (Certified)', icon: Award },
  { value: 'RotateCcw', label: 'Return Arrow (Returns)', icon: RotateCcw },
  { value: 'CreditCard', label: 'Credit Card (Payment)', icon: CreditCard },
  { value: 'Zap', label: 'Lightning (Fast)', icon: Zap },
];

const defaultBadges: Omit<TrustBadge, 'id'>[] = [
  { icon: 'Truck', title: 'Free Shipping', description: 'Orders above ₹2,999', is_active: true, sort_order: 0 },
  { icon: 'Award', title: 'Hallmarked 925', description: 'BIS Certified Silver', is_active: true, sort_order: 1 },
  { icon: 'RotateCcw', title: 'Easy Returns', description: '7-Day Return Policy', is_active: true, sort_order: 2 },
  { icon: 'Shield', title: 'Secure Payments', description: '100% Protected', is_active: true, sort_order: 3 },
  { icon: 'Zap', title: 'Express Delivery', description: '2-4 Business Days', is_active: true, sort_order: 4 },
  { icon: 'CreditCard', title: 'EMI Available', description: 'No Cost EMI', is_active: true, sort_order: 5 },
];

const AdminTrustBadges = () => {
  const [badges, setBadges] = useState<TrustBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<TrustBadge | null>(null);
  const [formData, setFormData] = useState({
    icon: 'Truck',
    title: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'trust_badges')
        .single();

      if (data?.value) {
        const parsedBadges = typeof data.value === 'string' 
          ? JSON.parse(data.value) 
          : data.value;
        setBadges(Array.isArray(parsedBadges) ? parsedBadges : defaultBadges.map((b, i) => ({ ...b, id: `badge-${i}` })));
      } else {
        // Initialize with defaults
        const initialBadges = defaultBadges.map((b, i) => ({ ...b, id: `badge-${i}` }));
        setBadges(initialBadges);
        await saveBadgesToDB(initialBadges);
      }
    } catch (error) {
      console.error('Error fetching trust badges:', error);
      const initialBadges = defaultBadges.map((b, i) => ({ ...b, id: `badge-${i}` }));
      setBadges(initialBadges);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBadgesToDB = async (badgesToSave: TrustBadge[]) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'trust_badges',
          value: JSON.stringify(badgesToSave),
          category: 'homepage',
          description: 'Trust badges displayed on homepage'
        }, { onConflict: 'key' });

      if (error) throw error;
      toast.success('Trust badges saved successfully');
    } catch (error) {
      console.error('Error saving trust badges:', error);
      toast.error('Failed to save trust badges');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => saveBadgesToDB(badges);

  const toggleBadge = (id: string) => {
    setBadges(prev => 
      prev.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b)
    );
  };

  const deleteBadge = (id: string) => {
    setBadges(prev => prev.filter(b => b.id !== id));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (editingBadge) {
      setBadges(prev => 
        prev.map(b => b.id === editingBadge.id 
          ? { ...b, ...formData }
          : b
        )
      );
    } else {
      const newBadge: TrustBadge = {
        id: `badge-${Date.now()}`,
        ...formData,
        sort_order: badges.length,
      };
      setBadges(prev => [...prev, newBadge]);
    }

    closeDialog();
  };

  const openEditDialog = (badge: TrustBadge) => {
    setEditingBadge(badge);
    setFormData({
      icon: badge.icon,
      title: badge.title,
      description: badge.description,
      is_active: badge.is_active,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBadge(null);
    setFormData({
      icon: 'Truck',
      title: '',
      description: '',
      is_active: true,
    });
  };

  const getIconComponent = (iconName: string) => {
    const option = iconOptions.find(o => o.value === iconName);
    return option ? option.icon : Shield;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Trust Badges</h1>
          <p className="text-muted-foreground">Manage trust badges shown on the homepage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Badge
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {badges.map((badge) => {
          const IconComponent = getIconComponent(badge.icon);
          return (
            <Card key={badge.id} className={!badge.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{badge.title}</h3>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={badge.is_active}
                      onCheckedChange={() => toggleBadge(badge.id)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(badge)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => deleteBadge(badge.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {badges.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No trust badges yet. Add your first badge.</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBadge ? 'Edit Badge' : 'Add Trust Badge'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Icon</Label>
              <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Free Shipping"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Orders above ₹2,999"
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
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingBadge ? 'Update' : 'Add'} Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTrustBadges;
