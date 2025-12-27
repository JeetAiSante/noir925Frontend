import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Mail, Phone, Calendar, Loader2, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { maskEmail, maskPhone, getInitials, formatCurrency } from '@/utils/secureData';

const AdminCustomers = () => {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('user_id, total');
      if (error) throw error;
      return data;
    },
  });

  const getCustomerStats = (userId: string) => {
    const customerOrders = orders?.filter(o => o.user_id === userId) || [];
    return {
      orderCount: customerOrders.length,
      totalSpent: customerOrders.reduce((sum, o) => sum + Number(o.total), 0),
    };
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
          <h1 className="font-display text-2xl md:text-3xl">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer base</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full text-xs">
          <Shield className="w-3 h-3" />
          Data Protected
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            All Customers
            <span className="text-xs font-normal text-muted-foreground">(PII masked for security)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map(profile => {
                const stats = getCustomerStats(profile.id);
                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{profile.full_name || 'Customer'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="font-mono text-xs">{maskEmail(profile.email)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span className="font-mono text-xs">{maskPhone(profile.phone)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{stats.orderCount} orders</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(stats.totalSpent)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Calendar className="w-3 h-3" />
                        {profile.created_at ? format(new Date(profile.created_at), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomers;
