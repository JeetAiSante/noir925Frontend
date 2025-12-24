import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Timer,
  Calendar,
  Clock,
  Zap,
  Loader2
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
import { toast } from 'sonner';
import { useCountdownTimers, useCreateTimer, useUpdateTimer, useDeleteTimer, CountdownTimer } from '@/hooks/useAdminData';

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  sale: { label: 'Sale', icon: Zap, color: 'bg-red-500/10 text-red-500' },
  banner: { label: 'Banner', icon: Timer, color: 'bg-blue-500/10 text-blue-500' },
  event: { label: 'Event', icon: Calendar, color: 'bg-purple-500/10 text-purple-500' },
};

const AdminTimers = () => {
  const { data: timers, isLoading } = useCountdownTimers();
  const createTimer = useCreateTimer();
  const updateTimer = useUpdateTimer();
  const deleteTimer = useDeleteTimer();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState<CountdownTimer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    end_time: '',
    link: '',
    position: 'banner',
    is_active: true,
  });

  const calculateTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${mins}m`;
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.end_time) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingTimer) {
      updateTimer.mutate({ 
        id: editingTimer.id, 
        data: formData 
      });
    } else {
      createTimer.mutate(formData as any);
    }

    closeDialog();
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTimer(null);
    setFormData({
      title: '',
      subtitle: '',
      end_time: '',
      link: '',
      position: 'banner',
      is_active: true,
    });
  };

  const handleEdit = (timer: CountdownTimer) => {
    setEditingTimer(timer);
    setFormData({
      title: timer.title,
      subtitle: timer.subtitle || '',
      end_time: timer.end_time.slice(0, 16), // Format for datetime-local input
      link: timer.link || '',
      position: timer.position,
      is_active: timer.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTimer.mutate(id);
  };

  const toggleActive = (timer: CountdownTimer) => {
    updateTimer.mutate({ 
      id: timer.id, 
      data: { is_active: !timer.is_active } 
    });
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
        {timers?.map((timer) => {
          const config = typeConfig[timer.position] || typeConfig.banner;
          const timeLeft = calculateTimeLeft(timer.end_time);
          
          return (
            <Card key={timer.id} className={`border-border/50 ${!timer.is_active && 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                      <config.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{timer.title}</CardTitle>
                      <span className={`text-xs px-2 py-0.5 rounded ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <Switch 
                    checked={timer.is_active}
                    onCheckedChange={() => toggleActive(timer)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{timer.subtitle}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(timer.end_time).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(timer.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    timeLeft === 'Expired' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                  }`}>
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-medium">{timeLeft}</span>
                  </div>
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

      {(!timers || timers.length === 0) && (
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
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Festive Sale - Up to 50% Off"
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
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              >
                {Object.entries(typeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>End Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
            <div>
              <Label>Link (optional)</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/shop?sale=festive"
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
            <Button 
              onClick={handleSubmit}
              disabled={createTimer.isPending || updateTimer.isPending}
            >
              {(createTimer.isPending || updateTimer.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingTimer ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTimers;
