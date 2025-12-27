import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Plus, Trash2, DollarSign, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CurrencySetting {
  id: string;
  currency_code: string;
  currency_symbol: string;
  currency_name: string;
  exchange_rate: number;
  country_codes: string[];
  is_default: boolean;
  is_active: boolean;
}

const AdminCurrencySettings = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCurrency, setNewCurrency] = useState({
    currency_code: '',
    currency_symbol: '',
    currency_name: '',
    exchange_rate: 1,
    country_codes: '',
    is_default: false,
    is_active: true,
  });

  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ['admin-currency-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('currency_settings')
        .select('*')
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      return data as CurrencySetting[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CurrencySetting> }) => {
      // If setting as default, unset others first
      if (updates.is_default) {
        await supabase
          .from('currency_settings')
          .update({ is_default: false })
          .neq('id', id);
      }

      const { error } = await supabase
        .from('currency_settings')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currency-settings'] });
      queryClient.invalidateQueries({ queryKey: ['currency-settings'] });
      toast.success('Currency updated');
    },
    onError: () => {
      toast.error('Failed to update currency');
    },
  });

  const addMutation = useMutation({
    mutationFn: async (currency: typeof newCurrency) => {
      const { error } = await supabase
        .from('currency_settings')
        .insert({
          ...currency,
          country_codes: currency.country_codes.split(',').map(c => c.trim().toUpperCase()),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currency-settings'] });
      setIsAddDialogOpen(false);
      setNewCurrency({
        currency_code: '',
        currency_symbol: '',
        currency_name: '',
        exchange_rate: 1,
        country_codes: '',
        is_default: false,
        is_active: true,
      });
      toast.success('Currency added');
    },
    onError: () => {
      toast.error('Failed to add currency');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('currency_settings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currency-settings'] });
      toast.success('Currency deleted');
    },
    onError: () => {
      toast.error('Failed to delete currency');
    },
  });

  const handleExchangeRateChange = (id: string, value: string) => {
    const rate = parseFloat(value) || 0;
    updateMutation.mutate({ id, updates: { exchange_rate: rate } });
  };

  return (
    <AdminSecurityWrapper>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin/settings">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <DollarSign className="h-8 w-8" />
                  Currency Settings
                </h1>
                <p className="text-muted-foreground">Manage currency conversion and display</p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Currency
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Currency</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Currency Code</Label>
                      <Input
                        value={newCurrency.currency_code}
                        onChange={(e) => setNewCurrency(prev => ({ ...prev, currency_code: e.target.value.toUpperCase() }))}
                        placeholder="USD"
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <Label>Symbol</Label>
                      <Input
                        value={newCurrency.currency_symbol}
                        onChange={(e) => setNewCurrency(prev => ({ ...prev, currency_symbol: e.target.value }))}
                        placeholder="$"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Currency Name</Label>
                    <Input
                      value={newCurrency.currency_name}
                      onChange={(e) => setNewCurrency(prev => ({ ...prev, currency_name: e.target.value }))}
                      placeholder="US Dollar"
                    />
                  </div>
                  <div>
                    <Label>Exchange Rate (from INR)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={newCurrency.exchange_rate}
                      onChange={(e) => setNewCurrency(prev => ({ ...prev, exchange_rate: parseFloat(e.target.value) || 0 }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      1 INR = {newCurrency.exchange_rate} {newCurrency.currency_code || 'XXX'}
                    </p>
                  </div>
                  <div>
                    <Label>Country Codes (comma separated)</Label>
                    <Input
                      value={newCurrency.country_codes}
                      onChange={(e) => setNewCurrency(prev => ({ ...prev, country_codes: e.target.value }))}
                      placeholder="US, UM"
                    />
                  </div>
                  <Button 
                    onClick={() => addMutation.mutate(newCurrency)} 
                    className="w-full"
                    disabled={addMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Add Currency
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Currencies</CardTitle>
              <CardDescription>
                Configure exchange rates and default currency for your store. 
                Exchange rates are relative to INR (base currency).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Exchange Rate</TableHead>
                      <TableHead>Countries</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((currency) => (
                      <TableRow key={currency.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{currency.currency_code}</div>
                            <div className="text-sm text-muted-foreground">{currency.currency_name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xl">{currency.currency_symbol}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.0001"
                            value={currency.exchange_rate}
                            onChange={(e) => handleExchangeRateChange(currency.id, e.target.value)}
                            className="w-28"
                            disabled={currency.currency_code === 'INR'}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {currency.country_codes.slice(0, 3).map((code) => (
                              <span key={code} className="px-2 py-0.5 bg-muted rounded text-xs">
                                {code}
                              </span>
                            ))}
                            {currency.country_codes.length > 3 && (
                              <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                +{currency.country_codes.length - 3}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={currency.is_default}
                            onCheckedChange={(checked) => 
                              updateMutation.mutate({ id: currency.id, updates: { is_default: checked } })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={currency.is_active}
                            onCheckedChange={(checked) => 
                              updateMutation.mutate({ id: currency.id, updates: { is_active: checked } })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(currency.id)}
                            disabled={currency.currency_code === 'INR'}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• All product prices are stored in INR (Indian Rupees) as the base currency.</p>
              <p>• Exchange rates define how many units of a currency equal 1 INR.</p>
              <p>• User location is auto-detected to show prices in their local currency.</p>
              <p>• Users can manually switch currencies using the currency selector in the header.</p>
              <p>• The default currency is shown when location cannot be detected.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminCurrencySettings;
