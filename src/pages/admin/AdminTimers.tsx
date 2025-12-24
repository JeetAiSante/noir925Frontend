import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Timer,
  Calendar,
  Clock,
  Zap
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

interface CountdownTimer {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  endDate: string;
  endTime: string;
  type: 'sale' | 'launch' | 'event';
  isActive: boolean;
  showOnHomepage: boolean;
}

const initialTimers: CountdownTimer[] = [
  {
    id: '1',
    name: 'Festive Sale Countdown',
    title: 'Festive Sale - Up to 50% Off',
    subtitle: 'Limited Time Offer',
    endDate: '2024-12-31',
    endTime: '23:59',
    type: 'sale',
    isActive: true,
    showOnHomepage: true,
  },
  {
    id: '2',
    name: 'Monsoon Collection Launch',
    title: 'New Monsoon Collection',
    subtitle: 'Coming Soon',
    endDate: '2024-08-01',
    endTime: '10:00',
    type: 'launch',
    isActive: true,
    showOnHomepage: false,
  },
];

const typeConfig = {
  sale: { label: 'Sale', icon: Zap, color: 'bg-red-500/10 text-red-500' },
  launch: { label: 'Product Launch', icon: Timer, color: 'bg-blue-500/10 text-blue-500' },
  event: { label: 'Event', icon: Calendar, color: 'bg-purple-500/10 text-purple-500' },
};

const AdminTimers = () => {
  const [timers, setTimers] = useState<CountdownTimer[]>(initialTimers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState<CountdownTimer | null>(null);
  const [formData, setFormData] = useState<Partial<CountdownTimer>>({
    name: '',
    title: '',
    subtitle: '',
    endDate: '',
    endTime: '',
    type: 'sale',
    isActive: true,
    showOnHomepage: true,
  });

  const calculateTimeLeft = (endDate: string, endTime: string) => {
    const end = new Date(`${endDate}T${endTime}`);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${mins}m`;
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.title || !formData.endDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingTimer) {
      setTimers(prev => prev.map(timer => 
        timer.id === editingTimer.id ? { ...timer, ...formData } as CountdownTimer : timer
      ));
      toast({ title: "Timer updated", description: "The countdown timer has been updated" });
    } else {
      const newTimer: CountdownTimer = {
        id: Date.now().toString(),
        ...formData as CountdownTimer,
      };
      setTimers(prev => [...prev, newTimer]);
      toast({ title: "Timer created", description: "New countdown timer has been created" });
    }

    closeDialog();
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTimer(null);
    setFormData({
      name: '',
      title: '',
      subtitle: '',
      endDate: '',
      endTime: '',
      type: 'sale',
      isActive: true,
      showOnHomepage: true,
    });
  };

  const handleEdit = (timer: CountdownTimer) => {
    setEditingTimer(timer);
    setFormData(timer);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
    toast({ title: "Timer deleted", description: "The countdown timer has been removed" });
  };

  const toggleActive = (id: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id ? { ...timer, isActive: !timer.isActive } : timer
    ));
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Countdown Timers</h1>
          <p className="text-muted-foreground">Manage sale countdowns and launch timers</p>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Timer
        </Button>
      </div>

      {/* Timers Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {timers.map((timer) => {
          const config = typeConfig[timer.type];
          const timeLeft = calculateTimeLeft(timer.endDate, timer.endTime);
          
          return (
            <Card key={timer.id} className={`border-border/50 ${!timer.isActive && 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                      <config.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{timer.name}</CardTitle>
                      <span className={`text-xs px-2 py-0.5 rounded ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <Switch 
                    checked={timer.isActive}
                    onCheckedChange={() => toggleActive(timer.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{timer.title}</p>
                    <p className="text-sm text-muted-foreground">{timer.subtitle}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {timer.endDate}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {timer.endTime}
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    timeLeft === 'Expired' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                  }`}>
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-medium">{timeLeft}</span>
                  </div>
                  
                  {timer.showOnHomepage && (
                    <p className="text-xs text-green-500">✓ Displayed on homepage</p>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(timer)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => handleDelete(timer.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {timers.length === 0 && (
        <div className="text-center py-12">
          <Timer className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No timers yet. Create your first countdown timer.</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingTimer ? 'Edit Timer' : 'Add New Timer'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Timer Name (internal)</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Black Friday Countdown"
              />
            </div>
            <div>
              <Label>Display Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Black Friday Sale - Up to 70% Off"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Limited Time Offer"
              />
            </div>
            <div>
              <Label>Timer Type</Label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CountdownTimer['type'] })}
              >
                {Object.entries(typeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.showOnHomepage}
                  onCheckedChange={(checked) => setFormData({ ...formData, showOnHomepage: checked })}
                />
                <Label>Show on Homepage</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingTimer ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTimers;