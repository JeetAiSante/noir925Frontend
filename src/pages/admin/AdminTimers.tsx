import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Timer,
  Calendar,
  Clock,
  Zap,
  Loader2,
  Palette,
  Gift,
  Percent,
  Star,
  Eye
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

interface ExtendedTimer extends CountdownTimer {
  bg_color?: string;
  text_color?: string;
  accent_color?: string;
  button_text?: string;
  icon_type?: string;
}

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  banner: { label: 'Banner', icon: Timer, color: 'bg-blue-500/10 text-blue-500' },
  sale: { label: 'Sale', icon: Zap, color: 'bg-red-500/10 text-red-500' },
  event: { label: 'Event', icon: Calendar, color: 'bg-purple-500/10 text-purple-500' },
};

const iconOptions = [
  { value: 'percent', label: 'Percent', icon: Percent },
  { value: 'gift', label: 'Gift', icon: Gift },
  { value: 'zap', label: 'Lightning', icon: Zap },
  { value: 'star', label: 'Star', icon: Star },
];

const colorPresets = [
  { name: 'Forest Green', bg: '#1a472a', text: '#ffffff', accent: '#c9a962' },
  { name: 'Royal Purple', bg: '#4a1a6b', text: '#ffffff', accent: '#ffd700' },
  { name: 'Ocean Blue', bg: '#1a3a5c', text: '#ffffff', accent: '#00d4ff' },
  { name: 'Sunset Orange', bg: '#7a2e00', text: '#ffffff', accent: '#ffcc00' },
  { name: 'Midnight Black', bg: '#1a1a1a', text: '#ffffff', accent: '#ff4081' },
  { name: 'Rose Gold', bg: '#b76e79', text: '#ffffff', accent: '#ffd700' },
];

const AdminTimers = () => {
  const { data: timers, isLoading } = useCountdownTimers();
  const createTimer = useCreateTimer();
  const updateTimer = useUpdateTimer();
  const deleteTimer = useDeleteTimer();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState<ExtendedTimer | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    end_time: '',
    link: '',
    position: 'banner',
    is_active: true,
    bg_color: '#1a472a',
    text_color: '#ffffff',
    accent_color: '#c9a962',
    button_text: 'Shop Sale',
    icon_type: 'percent',
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
    setShowPreview(false);
    setFormData({
      title: '',
      subtitle: '',
      end_time: '',
      link: '',
      position: 'banner',
      is_active: true,
      bg_color: '#1a472a',
      text_color: '#ffffff',
      accent_color: '#c9a962',
      button_text: 'Shop Sale',
      icon_type: 'percent',
    });
  };

  const handleEdit = (timer: ExtendedTimer) => {
    setEditingTimer(timer);
    setFormData({
      title: timer.title,
      subtitle: timer.subtitle || '',
      end_time: timer.end_time.slice(0, 16),
      link: timer.link || '',
      position: timer.position,
      is_active: timer.is_active,
      bg_color: timer.bg_color || '#1a472a',
      text_color: timer.text_color || '#ffffff',
      accent_color: timer.accent_color || '#c9a962',
      button_text: timer.button_text || 'Shop Sale',
      icon_type: timer.icon_type || 'percent',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this timer?')) {
      deleteTimer.mutate(id);
    }
  };

  const toggleActive = (timer: ExtendedTimer) => {
    updateTimer.mutate({ 
      id: timer.id, 
      data: { is_active: !timer.is_active } 
    });
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setFormData(prev => ({
      ...prev,
      bg_color: preset.bg,
      text_color: preset.text,
      accent_color: preset.accent,
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const SelectedIcon = iconOptions.find(i => i.value === formData.icon_type)?.icon || Percent;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Countdown Timers</h1>
          <p className="text-muted-foreground">Manage sale countdowns with custom colors and styling</p>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Timer
        </Button>
      </div>

      {/* Timers Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {(timers as ExtendedTimer[])?.map((timer) => {
          const config = typeConfig[timer.position] || typeConfig.banner;
          const timeLeft = calculateTimeLeft(timer.end_time);
          
          return (
            <Card key={timer.id} className={`border-border/50 overflow-hidden ${!timer.is_active && 'opacity-60'}`}>
              {/* Color Preview Bar */}
              <div 
                className="h-2"
                style={{ backgroundColor: timer.bg_color || '#1a472a' }}
              />
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
                  <p className="text-sm text-muted-foreground">{timer.subtitle}</p>
                  
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

                  {/* Color swatches */}
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <div 
                      className="w-5 h-5 rounded-full border border-border" 
                      style={{ backgroundColor: timer.bg_color || '#1a472a' }}
                      title="Background"
                    />
                    <div 
                      className="w-5 h-5 rounded-full border border-border" 
                      style={{ backgroundColor: timer.text_color || '#ffffff' }}
                      title="Text"
                    />
                    <div 
                      className="w-5 h-5 rounded-full border border-border" 
                      style={{ backgroundColor: timer.accent_color || '#c9a962' }}
                      title="Accent"
                    />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingTimer ? 'Edit Timer' : 'Add New Timer'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Festive Sale - Up to 50% Off"
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Limited Time Offer"
                />
              </div>
              <div>
                <Label>End Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
              <div>
                <Label>Link</Label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/shop?sale=festive"
                />
              </div>
              <div>
                <Label>Button Text</Label>
                <Input
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="Shop Sale"
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
            </div>

            {/* Right Column - Styling */}
            <div className="space-y-4">
              <div>
                <Label>Icon</Label>
                <div className="flex gap-2 mt-2">
                  {iconOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon_type: opt.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.icon_type === opt.value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      title={opt.label}
                    >
                      <opt.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Color Presets</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyColorPreset(preset)}
                      className="flex items-center gap-1 px-2 py-1 rounded border border-border hover:border-primary/50 transition-all text-xs"
                    >
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: preset.bg }}
                      />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Background</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={formData.bg_color}
                      onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={formData.bg_color}
                      onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Text</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Accent</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              {/* Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Preview</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {showPreview ? 'Hide' : 'Show'}
                  </Button>
                </div>
                {showPreview && (
                  <div 
                    className="rounded-lg p-4 flex items-center justify-between"
                    style={{ backgroundColor: formData.bg_color }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${formData.text_color}20` }}
                      >
                        <SelectedIcon className="w-5 h-5" style={{ color: formData.text_color }} />
                      </div>
                      <div>
                        <p 
                          className="text-xs uppercase tracking-wide"
                          style={{ color: `${formData.text_color}cc` }}
                        >
                          {formData.subtitle || 'Limited Time'}
                        </p>
                        <p 
                          className="font-display"
                          style={{ color: formData.text_color }}
                        >
                          {formData.title || 'Timer Title'}
                        </p>
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg font-medium text-sm"
                      style={{ 
                        backgroundColor: formData.text_color,
                        color: formData.bg_color
                      }}
                    >
                      {formData.button_text || 'Shop Sale'}
                    </button>
                  </div>
                )}
              </div>
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
