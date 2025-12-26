import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Save, 
  Settings,
  ChevronUp,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HomepageSection {
  id: string;
  section_key: string;
  section_name: string;
  is_visible: boolean;
  sort_order: number;
  settings: Record<string, any> | null;
}

const defaultSections: Omit<HomepageSection, 'id'>[] = [
  { section_key: 'hero', section_name: 'Hero Section', is_visible: true, sort_order: 1, settings: { showVideo: true } },
  { section_key: 'countdown', section_name: 'Countdown Banner', is_visible: true, sort_order: 2, settings: null },
  { section_key: 'festival', section_name: 'Festival Banner', is_visible: true, sort_order: 3, settings: null },
  { section_key: 'trust_strip', section_name: 'Trust Strip', is_visible: true, sort_order: 4, settings: null },
  { section_key: 'categories', section_name: 'Categories Carousel', is_visible: true, sort_order: 5, settings: { limit: 10 } },
  { section_key: 'bestsellers', section_name: 'Bestsellers Grid', is_visible: true, sort_order: 6, settings: { limit: 8 } },
  { section_key: 'price_based', section_name: 'Price Based Products', is_visible: true, sort_order: 7, settings: null },
  { section_key: 'gender_shop', section_name: 'Shop by Gender', is_visible: true, sort_order: 8, settings: null },
  { section_key: 'wedding', section_name: 'Wedding Collection', is_visible: true, sort_order: 9, settings: null },
  { section_key: 'gift_box', section_name: 'Gift Box Categories', is_visible: true, sort_order: 10, settings: null },
  { section_key: 'parallax', section_name: 'Parallax Banner', is_visible: true, sort_order: 11, settings: null },
  { section_key: 'new_arrivals', section_name: 'New Arrivals', is_visible: true, sort_order: 12, settings: { limit: 8 } },
  { section_key: 'trending', section_name: 'Trending Slider', is_visible: true, sort_order: 13, settings: null },
  { section_key: 'dailywear', section_name: 'Dailywear Section', is_visible: true, sort_order: 14, settings: null },
  { section_key: 'reviews_carousel', section_name: 'Reviews Carousel', is_visible: true, sort_order: 15, settings: null },
  { section_key: 'editorial', section_name: 'Luxury Editorial', is_visible: true, sort_order: 16, settings: null },
  { section_key: 'video_showcase', section_name: 'Video Showcase', is_visible: true, sort_order: 17, settings: null },
  { section_key: 'featured_categories', section_name: 'Featured Categories', is_visible: true, sort_order: 18, settings: null },
  { section_key: 'seasonal', section_name: 'Seasonal Banner', is_visible: true, sort_order: 19, settings: null },
  { section_key: 'promo', section_name: 'Promo Banners', is_visible: true, sort_order: 20, settings: null },
  { section_key: 'brand_story', section_name: 'Brand Story', is_visible: true, sort_order: 21, settings: null },
  { section_key: 'collections', section_name: 'Collections Story', is_visible: true, sort_order: 22, settings: null },
  { section_key: 'occasion', section_name: 'Shop by Occasion', is_visible: true, sort_order: 23, settings: null },
  { section_key: 'silver_care', section_name: 'Silver Care Guide', is_visible: true, sort_order: 24, settings: null },
  { section_key: 'partners', section_name: 'Brand Partners', is_visible: true, sort_order: 25, settings: null },
  { section_key: 'reviews', section_name: 'Customer Reviews', is_visible: true, sort_order: 26, settings: null },
  { section_key: 'instagram', section_name: 'Instagram Feed', is_visible: true, sort_order: 27, settings: null },
  { section_key: 'newsletter', section_name: 'Newsletter', is_visible: true, sort_order: 28, settings: null },
  { section_key: 'recently_viewed', section_name: 'Recently Viewed', is_visible: true, sort_order: 29, settings: null },
  { section_key: 'final_cta', section_name: 'Final CTA', is_visible: true, sort_order: 30, settings: null },
];

const AdminHomepageSections = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<HomepageSection | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSections(data.map(s => ({
          ...s,
          settings: s.settings as Record<string, any> | null
        })));
      } else {
        // Initialize with defaults
        await initializeDefaults();
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .insert(defaultSections)
        .select();

      if (error) throw error;
      if (data) {
        setSections(data.map(s => ({
          ...s,
          settings: s.settings as Record<string, any> | null
        })));
      }
      toast.success('Sections initialized');
    } catch (error) {
      console.error('Error initializing:', error);
    }
  };

  const handleVisibilityToggle = (id: string) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { ...s, is_visible: !s.is_visible } : s
    ));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    // Update sort orders
    newSections.forEach((s, i) => {
      s.sort_order = i + 1;
    });
    
    setSections(newSections);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);

    newSections.forEach((s, i) => {
      s.sort_order = i + 1;
    });

    setSections(newSections);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        const { error } = await supabase
          .from('homepage_sections')
          .update({
            is_visible: section.is_visible,
            sort_order: section.sort_order,
            settings: section.settings
          })
          .eq('id', section.id);

        if (error) throw error;
      }
      toast.success('Sections saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Reset all sections to default order and visibility?')) return;
    
    try {
      await supabase.from('homepage_sections').delete().neq('id', '');
      await initializeDefaults();
      toast.success('Reset to defaults');
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  const openSettings = (section: HomepageSection) => {
    setSelectedSection(section);
    setSettingsOpen(true);
  };

  const updateSectionSettings = (key: string, value: any) => {
    if (!selectedSection) return;
    
    const newSettings = { ...(selectedSection.settings || {}), [key]: value };
    
    setSections(prev => prev.map(s => 
      s.id === selectedSection.id ? { ...s, settings: newSettings } : s
    ));
    setSelectedSection({ ...selectedSection, settings: newSettings });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Homepage Sections</h1>
          <p className="text-muted-foreground">Drag to reorder, toggle visibility, and configure settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveChanges} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Order & Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                draggedIndex === index ? 'bg-accent border-primary' : 'bg-background hover:bg-accent/50'
              } ${!section.is_visible ? 'opacity-50' : ''}`}
            >
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
              
              <span className="w-8 text-sm text-muted-foreground font-mono">
                {String(index + 1).padStart(2, '0')}
              </span>
              
              <div className="flex-1">
                <span className="font-medium">{section.section_name}</span>
                <span className="ml-2 text-xs text-muted-foreground">({section.section_key})</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => openSettings(section)}
              >
                <Settings className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                {section.is_visible ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
                <Switch
                  checked={section.is_visible}
                  onCheckedChange={() => handleVisibilityToggle(section.id)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedSection?.section_name} Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Universal settings for all sections */}
            <div className="space-y-4 border-b pb-4">
              <h4 className="font-medium text-sm text-muted-foreground">Display Settings</h4>
              <div className="space-y-2">
                <Label>Custom Title (optional)</Label>
                <Input
                  placeholder="Leave empty for default"
                  value={selectedSection?.settings?.customTitle ?? ''}
                  onChange={(e) => updateSectionSettings('customTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Custom Subtitle (optional)</Label>
                <Input
                  placeholder="Leave empty for default"
                  value={selectedSection?.settings?.customSubtitle ?? ''}
                  onChange={(e) => updateSectionSettings('customSubtitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-12 h-10 p-1 cursor-pointer"
                    value={selectedSection?.settings?.bgColor ?? '#ffffff'}
                    onChange={(e) => updateSectionSettings('bgColor', e.target.value)}
                  />
                  <Input
                    placeholder="#ffffff or transparent"
                    value={selectedSection?.settings?.bgColor ?? ''}
                    onChange={(e) => updateSectionSettings('bgColor', e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSectionSettings('bgColor', '')}
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-12 h-10 p-1 cursor-pointer"
                    value={selectedSection?.settings?.textColor ?? '#000000'}
                    onChange={(e) => updateSectionSettings('textColor', e.target.value)}
                  />
                  <Input
                    placeholder="#000000"
                    value={selectedSection?.settings?.textColor ?? ''}
                    onChange={(e) => updateSectionSettings('textColor', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Full Width Layout</Label>
                <Switch
                  checked={selectedSection?.settings?.fullWidth ?? false}
                  onCheckedChange={(v) => updateSectionSettings('fullWidth', v)}
                />
              </div>
            </div>

            {/* Section-specific settings */}
            {selectedSection?.section_key === 'hero' && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Hero Settings</h4>
                <div className="flex items-center justify-between">
                  <Label>Show Video Background</Label>
                  <Switch
                    checked={selectedSection.settings?.showVideo ?? true}
                    onCheckedChange={(v) => updateSectionSettings('showVideo', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Overlay Text</Label>
                  <Switch
                    checked={selectedSection.settings?.showOverlay ?? true}
                    onCheckedChange={(v) => updateSectionSettings('showOverlay', v)}
                  />
                </div>
              </div>
            )}

            {['bestsellers', 'new_arrivals', 'categories', 'trending'].includes(selectedSection?.section_key || '') && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Product Display</h4>
                <div className="space-y-2">
                  <Label>Items to Display</Label>
                  <Input
                    type="number"
                    min={4}
                    max={24}
                    value={selectedSection?.settings?.limit ?? 8}
                    onChange={(e) => updateSectionSettings('limit', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show View All Button</Label>
                  <Switch
                    checked={selectedSection?.settings?.showViewAll ?? true}
                    onCheckedChange={(v) => updateSectionSettings('showViewAll', v)}
                  />
                </div>
              </div>
            )}

            {['countdown', 'festival', 'parallax', 'seasonal', 'promo'].includes(selectedSection?.section_key || '') && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Banner Settings</h4>
                <div className="flex items-center justify-between">
                  <Label>Auto-hide when expired</Label>
                  <Switch
                    checked={selectedSection?.settings?.autoHide ?? true}
                    onCheckedChange={(v) => updateSectionSettings('autoHide', v)}
                  />
                </div>
              </div>
            )}

            {selectedSection?.section_key === 'instagram' && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Instagram Settings</h4>
                <div className="space-y-2">
                  <Label>Posts to Display</Label>
                  <Input
                    type="number"
                    min={3}
                    max={12}
                    value={selectedSection?.settings?.postsCount ?? 6}
                    onChange={(e) => updateSectionSettings('postsCount', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}

            {selectedSection?.section_key === 'newsletter' && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Newsletter Settings</h4>
                <div className="space-y-2">
                  <Label>Discount Offer Text</Label>
                  <Input
                    placeholder="e.g., Get 10% OFF"
                    value={selectedSection?.settings?.discountText ?? ''}
                    onChange={(e) => updateSectionSettings('discountText', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomepageSections;
