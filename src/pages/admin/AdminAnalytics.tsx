import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, Loader2, ArrowUpRight, ArrowDownRight, Eye, Clock, CreditCard, RefreshCcw } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  
  // Fetch orders for analytics
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['analytics-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ['analytics-order-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['analytics-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, created_at, email, full_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['analytics-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, is_active');
      if (error) throw error;
      return data;
    },
  });

  // Get days based on time range
  const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  
  // Calculate stats
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalCustomers = profiles?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate period comparisons
  const now = new Date();
  const periodStart = subDays(now, daysCount);
  const previousPeriodStart = subDays(periodStart, daysCount);
  
  const currentPeriodOrders = orders?.filter(o => new Date(o.created_at!) >= periodStart) || [];
  const previousPeriodOrders = orders?.filter(o => {
    const date = new Date(o.created_at!);
    return date >= previousPeriodStart && date < periodStart;
  }) || [];

  const currentRevenue = currentPeriodOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  const currentOrderCount = currentPeriodOrders.length;
  const previousOrderCount = previousPeriodOrders.length;
  const orderChange = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0;

  // Revenue data for chart
  const chartData = Array.from({ length: daysCount }, (_, i) => {
    const date = subDays(now, daysCount - 1 - i);
    const dayOrders = orders?.filter(o => {
      const orderDate = new Date(o.created_at!);
      return orderDate >= startOfDay(date) && orderDate <= endOfDay(date);
    }) || [];
    return {
      date: format(date, daysCount > 14 ? 'MMM d' : 'EEE'),
      revenue: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
      orders: dayOrders.length,
    };
  });

  // Monthly revenue trend (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(now, 5 - i);
    const monthOrders = orders?.filter(o => {
      const orderDate = new Date(o.created_at!);
      return orderDate >= startOfMonth(monthDate) && orderDate <= endOfMonth(monthDate);
    }) || [];
    return {
      month: format(monthDate, 'MMM'),
      revenue: monthOrders.reduce((sum, o) => sum + Number(o.total), 0),
      orders: monthOrders.length,
    };
  });

  // Order status distribution
  const statusData = orders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const pieData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  // Top selling products
  const topProducts = orderItems?.reduce((acc, item) => {
    const existing = acc.find(p => p.product_name === item.product_name);
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += Number(item.price) * item.quantity;
    } else {
      acc.push({
        product_name: item.product_name,
        quantity: item.quantity,
        revenue: Number(item.price) * item.quantity,
      });
    }
    return acc;
  }, [] as { product_name: string; quantity: number; revenue: number }[])
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5) || [];

  // Payment method distribution
  const paymentMethods = orders?.reduce((acc, order) => {
    const method = order.payment_method || 'Unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Inventory stats
  const lowStockProducts = products?.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10) || [];
  const outOfStockProducts = products?.filter(p => p.stock_quantity === 0) || [];

  // Customer acquisition over time
  const newCustomersData = Array.from({ length: daysCount }, (_, i) => {
    const date = subDays(now, daysCount - 1 - i);
    const dayCustomers = profiles?.filter(p => {
      const createdDate = new Date(p.created_at!);
      return createdDate >= startOfDay(date) && createdDate <= endOfDay(date);
    }) || [];
    return {
      date: format(date, daysCount > 14 ? 'MMM d' : 'EEE'),
      customers: dayCustomers.length,
    };
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time store performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="flex items-center gap-1 mt-1">
              {revenueChange >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(revenueChange).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="flex items-center gap-1 mt-1">
              {orderChange >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs ${orderChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(orderChange).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <div className="w-8 h-8 rounded-full bg-chart-3/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <div className="w-8 h-8 rounded-full bg-chart-4/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-xl font-bold">{orders?.filter(o => o.status === 'pending').length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-xl font-bold">{orders?.filter(o => o.status === 'processing').length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-xl font-bold">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-xl font-bold">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="orders" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No order data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{product.product_name}</p>
                        <p className="text-xs text-muted-foreground">{product.quantity} sold</p>
                      </div>
                    </div>
                    <span className="font-semibold">₹{product.revenue.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No sales data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Acquisition */}
        <Card>
          <CardHeader>
            <CardTitle>New Customer Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={newCustomersData}>
                <defs>
                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="hsl(var(--chart-4))" 
                  strokeWidth={2}
                  fill="url(#colorCustomers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="pb-2 font-medium text-sm text-muted-foreground">Order ID</th>
                    <th className="pb-2 font-medium text-sm text-muted-foreground">Date</th>
                    <th className="pb-2 font-medium text-sm text-muted-foreground">Status</th>
                    <th className="pb-2 font-medium text-sm text-muted-foreground">Payment</th>
                    <th className="pb-2 font-medium text-sm text-muted-foreground text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b border-border/50">
                      <td className="py-3 font-mono text-sm">{order.order_number}</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {format(new Date(order.created_at!), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                          order.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                          order.status === 'shipped' ? 'bg-purple-500/10 text-purple-500' :
                          order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' :
                          order.payment_status === 'failed' ? 'bg-red-500/10 text-red-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {order.payment_status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">₹{Number(order.total).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No orders yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;