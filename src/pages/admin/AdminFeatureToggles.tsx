import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeatureToggle {
  id: string;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  description: string | null;
}

const AdminFeatureToggles = () => {
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    const { data, error } = await supabase
      .from('feature_toggles')
      .select('*')
      .order('feature_name');
    
    if (data) {
      setFeatures(data);
    }
    setIsLoading(false);
  };

  const handleToggle = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('feature_toggles')
      .update({ is_enabled: !currentValue })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update feature');
    } else {
      setFeatures(features.map(f => 
        f.id === id ? { ...f, is_enabled: !currentValue } : f
      ));
      toast.success('Feature updated');
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
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Feature Toggles</h1>
          <p className="text-muted-foreground">Enable or disable website features</p>
        </div>
        <Button variant="outline" onClick={fetchFeatures}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Features</CardTitle>
          <CardDescription>Control which features are active on your website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    feature.is_enabled ? 'bg-green-500/10' : 'bg-muted'
                  }`}>
                    {feature.is_enabled ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{feature.feature_name}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Switch
                  checked={feature.is_enabled}
                  onCheckedChange={() => handleToggle(feature.id, feature.is_enabled)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeatureToggles;
