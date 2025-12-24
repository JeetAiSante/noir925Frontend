import { useState } from 'react';
import { useSiteSettings, useUpdateSiteSetting, useHomepageSections, useUpdateHomepageSection } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Globe, Mail, Share2, Eye, EyeOff, GripVertical, Save, Loader2 } from 'lucide-react';

const AdminSettings = () => {
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const { data: sections, isLoading: sectionsLoading } = useHomepageSections();
  const updateSetting = useUpdateSiteSetting();
  const updateSection = useUpdateHomepageSection();
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});

  const getSettingsByCategory = (category: string) => {
    return settings?.filter(s => s.category === category) || [];
  };

  const handleSettingChange = (id: string, value: any) => {
    setEditedSettings(prev => ({ ...prev, [id]: value }));
  };

  const saveSettings = () => {
    Object.entries(editedSettings).forEach(([id, value]) => {
      updateSetting.mutate({ id, value: JSON.stringify(value) });
    });
    setEditedSettings({});
  };

  const toggleSectionVisibility = (id: string, isVisible: boolean) => {
    updateSection.mutate({ id, data: { is_visible: isVisible } });
  };

  if (settingsLoading || sectionsLoading) {
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
          <h1 className="font-display text-2xl md:text-3xl">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your website configuration</p>
        </div>
        {Object.keys(editedSettings).length > 0 && (
          <Button onClick={saveSettings} disabled={updateSetting.isPending}>
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Sections</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic website configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('general').map(setting => (
                <div key={setting.id} className="grid gap-2">
                  <Label htmlFor={setting.key}>{setting.description || setting.key}</Label>
                  <Input
                    id={setting.key}
                    defaultValue={typeof setting.value === 'string' ? setting.value.replace(/^"|"$/g, '') : setting.value}
                    onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Your business contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('contact').map(setting => (
                <div key={setting.id} className="grid gap-2">
                  <Label htmlFor={setting.key}>{setting.description || setting.key}</Label>
                  <Input
                    id={setting.key}
                    defaultValue={typeof setting.value === 'string' ? setting.value.replace(/^"|"$/g, '') : setting.value}
                    onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Connect your social media accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('social').map(setting => (
                <div key={setting.id} className="grid gap-2">
                  <Label htmlFor={setting.key}>{setting.description || setting.key}</Label>
                  <Input
                    id={setting.key}
                    defaultValue={typeof setting.value === 'string' ? setting.value.replace(/^"|"$/g, '') : setting.value}
                    onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Sections</CardTitle>
              <CardDescription>Control which sections are visible on the homepage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sections?.map(section => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <div>
                        <p className="font-medium">{section.section_name}</p>
                        <p className="text-xs text-muted-foreground">{section.section_key}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {section.is_visible ? (
                        <Eye className="w-4 h-4 text-primary" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={section.is_visible}
                        onCheckedChange={(checked) => toggleSectionVisibility(section.id, checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
