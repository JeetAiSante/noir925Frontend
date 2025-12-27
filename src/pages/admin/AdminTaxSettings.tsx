import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Percent, IndianRupee, Info } from 'lucide-react';
import { toast } from 'sonner';

interface TaxSettings {
  id: string;
  tax_name: string;
  tax_percent: number;
  is_enabled: boolean;
  is_inclusive: boolean;
}

const AdminTaxSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<TaxSettings>>({
    tax_name: 'GST',
    tax_percent: 0,
    is_enabled: true,
    is_inclusive: false,
  });

  const { data: taxSettings, isLoading } = useQuery({
    queryKey: ['tax-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as TaxSettings | null;
    },
  });

  useEffect(() => {
    if (taxSettings) {
      setFormData({
        tax_name: taxSettings.tax_name,
        tax_percent: taxSettings.tax_percent,
        is_enabled: taxSettings.is_enabled ?? true,
        is_inclusive: taxSettings.is_inclusive ?? false,
      });
    }
  }, [taxSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<TaxSettings>) => {
      if (taxSettings?.id) {
        const { error } = await supabase
          .from('tax_settings')
          .update(data)
          .eq('id', taxSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tax_settings')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
      toast.success('Tax settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save tax settings');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
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
          <h1 className="font-display text-2xl md:text-3xl">Tax & GST Settings</h1>
          <p className="text-muted-foreground mt-1">Configure tax calculations for your orders</p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              Tax Configuration
            </CardTitle>
            <CardDescription>Set up your tax/GST percentage and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tax-enabled">Enable Tax</Label>
                <p className="text-xs text-muted-foreground">Apply tax to all orders</p>
              </div>
              <Switch
                id="tax-enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tax-name">Tax Name</Label>
              <Input
                id="tax-name"
                value={formData.tax_name}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_name: e.target.value }))}
                placeholder="e.g., GST, VAT, Sales Tax"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tax-percent">Tax Percentage (%)</Label>
              <div className="relative">
                <Input
                  id="tax-percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.tax_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_percent: parseFloat(e.target.value) || 0 }))}
                  className="pr-10"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tax-inclusive">Tax Inclusive Pricing</Label>
                <p className="text-xs text-muted-foreground">Product prices already include tax</p>
              </div>
              <Switch
                id="tax-inclusive"
                checked={formData.is_inclusive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_inclusive: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              Tax Preview
            </CardTitle>
            <CardDescription>See how tax will be applied to orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sample Product Price</span>
                <span>₹1,000</span>
              </div>
              {formData.is_enabled && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{formData.tax_name} ({formData.tax_percent}%)</span>
                    <span className={formData.is_inclusive ? 'text-muted-foreground' : 'text-foreground'}>
                      {formData.is_inclusive ? 'Included' : `₹${(1000 * (formData.tax_percent || 0) / 100).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-medium">
                    <span>Total</span>
                    <span>
                      ₹{formData.is_inclusive ? '1,000' : (1000 + (1000 * (formData.tax_percent || 0) / 100)).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              {!formData.is_enabled && (
                <div className="border-t pt-3 flex justify-between font-medium">
                  <span>Total (No Tax)</span>
                  <span>₹1,000</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                {formData.is_inclusive 
                  ? 'Tax-inclusive pricing means your displayed prices already include tax. The tax amount will be shown separately at checkout.'
                  : 'Tax-exclusive pricing means tax will be added on top of the product price at checkout.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTaxSettings;