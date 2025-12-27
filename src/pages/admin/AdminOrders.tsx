import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/context/CurrencyContext';
import { 
  Search, 
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  User,
  MapPin,
  Phone,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';
import InvoiceGenerator from '@/components/admin/InvoiceGenerator';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/10 text-yellow-500' },
  processing: { label: 'Processing', icon: Package, color: 'bg-blue-500/10 text-blue-500' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-500/10 text-purple-500' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-500/10 text-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-500/10 text-red-500' },
};

interface ShippingAddress {
  full_name?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface SiteContact {
  company_name?: string;
  company_logo?: string;
  company_signature?: string;
  invoice_prefix?: string;
  address?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  whatsapp?: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [siteContact, setSiteContact] = useState<SiteContact | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchOrders();
    fetchSiteContact();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSiteContact = async () => {
    try {
      const { data } = await supabase
        .from('site_contact')
        .select('*')
        .single();
      setSiteContact(data);
    } catch (error) {
      console.error('Error fetching site contact:', error);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const fetchCustomerProfile = async (userId: string | null) => {
    if (!userId) {
      setCustomerProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setCustomerProfile(data);
    } catch (error) {
      console.error('Error fetching customer:', error);
      setCustomerProfile(null);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const viewOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    await Promise.all([
      fetchOrderItems(order.id),
      fetchCustomerProfile(order.user_id)
    ]);
  };

  const sendStatusEmail = async () => {
    if (!selectedOrder) return;
    
    setSendingEmail(true);
    try {
      const shippingAddress = selectedOrder.shipping_address as ShippingAddress;
      const customerEmail = shippingAddress?.email || customerProfile?.email;
      
      if (!customerEmail) {
        toast({
          title: "Error",
          description: "No customer email found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'order_status',
          data: {
            to: customerEmail,
            orderNumber: selectedOrder.order_number,
            customerName: shippingAddress?.full_name || 'Customer',
            status: selectedOrder.status,
            total: selectedOrder.total,
            companyName: siteContact?.company_name,
            companyLogo: siteContact?.company_logo,
            companySignature: siteContact?.company_signature,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Email sent",
        description: `Status update email sent to ${customerEmail}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const getCustomerEmail = () => {
    if (!selectedOrder) return '';
    const shippingAddress = selectedOrder.shipping_address as ShippingAddress;
    return shippingAddress?.email || customerProfile?.email || '';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <AdminSecurityWrapper>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminSecurityWrapper>
    );
  }

  return (
    <AdminSecurityWrapper>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Orders</h1>
          <p className="text-muted-foreground">{orders.length} total orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = orders.filter(o => o.status === key).length;
            return (
              <Card key={key} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter(key)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                    <config.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="bg-background rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-sm">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                  const shippingAddress = order.shipping_address as ShippingAddress;
                  
                  return (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{order.id.slice(0, 8)}...</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{shippingAddress?.full_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{shippingAddress?.phone || ''}</p>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={status.color}>
                          <status.icon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 font-medium">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Select 
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </div>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center justify-between">
                <span>Order {selectedOrder?.order_number}</span>
                <Badge className={statusConfig[selectedOrder?.status as keyof typeof statusConfig]?.color}>
                  {selectedOrder?.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="customer">Customer</TabsTrigger>
                  <TabsTrigger value="invoice">Invoice</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-4">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Order ID</p>
                      <p className="font-medium text-sm">{selectedOrder.id.slice(0, 8)}...</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-medium text-sm">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="font-medium text-sm">{selectedOrder.payment_method || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Payment Status</p>
                      <p className="font-medium text-sm">{selectedOrder.payment_status || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-medium mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                        >
                          {item.product_image && (
                            <img 
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                            {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                          </div>
                          <p className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.shipping_cost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{formatPrice(selectedOrder.shipping_cost)}</span>
                      </div>
                    )}
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>Discount</span>
                        <span>-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    {selectedOrder.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatPrice(selectedOrder.tax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold border-t border-border pt-2">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Customer Notes</p>
                      <p className="text-sm">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    <Select 
                      value={selectedOrder.status}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={sendStatusEmail} disabled={sendingEmail}>
                      {sendingEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                      {sendingEmail ? 'Sending...' : 'Send Status Email'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="customer" className="space-y-6 mt-4">
                  {(() => {
                    const shippingAddress = selectedOrder.shipping_address as ShippingAddress;
                    return (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Customer Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span>{shippingAddress?.full_name || customerProfile?.full_name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{shippingAddress?.phone || customerProfile?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span>{shippingAddress?.email || customerProfile?.email || 'N/A'}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Shipping Address
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>{shippingAddress?.address_line1}</p>
                            {shippingAddress?.address_line2 && <p>{shippingAddress.address_line2}</p>}
                            <p>{shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postal_code}</p>
                            <p>{shippingAddress?.country || 'India'}</p>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="invoice" className="mt-4">
                  <InvoiceGenerator
                    order={selectedOrder}
                    orderItems={orderItems}
                    siteContact={siteContact}
                    customerEmail={getCustomerEmail()}
                  />
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminOrders;