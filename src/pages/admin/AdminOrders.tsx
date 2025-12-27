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
  FileText,
  Download,
  User,
  MapPin,
  Phone
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

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [siteContact, setSiteContact] = useState<any>(null);
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
          to: customerEmail,
          subject: `Order ${selectedOrder.order_number} - Status Update`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #D4AF37 0%, #8B7355 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">NOIR925</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2>Order Status Update</h2>
                <p>Dear ${shippingAddress?.full_name || 'Customer'},</p>
                <p>Your order <strong>${selectedOrder.order_number}</strong> status has been updated to:</p>
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 18px; font-weight: bold; color: #D4AF37; text-transform: uppercase;">
                    ${selectedOrder.status}
                  </span>
                </div>
                <p>Order Total: <strong>${formatPrice(selectedOrder.total)}</strong></p>
                <p>Thank you for shopping with NOIR925!</p>
              </div>
              <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                <p>© 2024 NOIR925. All rights reserved.</p>
              </div>
            </div>
          `,
        },
      });

      if (error) throw error;

      toast({
        title: "Email sent",
        description: "Status update email sent to customer",
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

  const generateInvoiceHTML = () => {
    if (!selectedOrder) return '';
    
    const shippingAddress = selectedOrder.shipping_address as ShippingAddress;
    const orderDate = new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 20px;">
          <div>
            <h1 style="color: #D4AF37; margin: 0;">NOIR925</h1>
            <p style="color: #666; margin: 5px 0;">Premium 925 Sterling Silver Jewellery</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0;">INVOICE</h2>
            <p style="color: #666; margin: 5px 0;">${selectedOrder.order_number}</p>
            <p style="color: #666; margin: 5px 0;">${orderDate}</p>
          </div>
        </div>

        <!-- Addresses -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h4 style="margin: 0 0 10px 0; color: #333;">Bill To:</h4>
            <p style="margin: 3px 0;">${shippingAddress?.full_name || 'N/A'}</p>
            <p style="margin: 3px 0;">${shippingAddress?.address_line1 || ''}</p>
            ${shippingAddress?.address_line2 ? `<p style="margin: 3px 0;">${shippingAddress.address_line2}</p>` : ''}
            <p style="margin: 3px 0;">${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} ${shippingAddress?.postal_code || ''}</p>
            <p style="margin: 3px 0;">${shippingAddress?.phone || ''}</p>
          </div>
          <div style="text-align: right;">
            <h4 style="margin: 0 0 10px 0; color: #333;">From:</h4>
            <p style="margin: 3px 0;">${siteContact?.company_name || 'NOIR925'}</p>
            <p style="margin: 3px 0;">${siteContact?.address || ''}</p>
            <p style="margin: 3px 0;">${siteContact?.phone || ''}</p>
            <p style="margin: 3px 0;">${siteContact?.email || ''}</p>
            ${siteContact?.gst_number ? `<p style="margin: 3px 0;">GST: ${siteContact.gst_number}</p>` : ''}
          </div>
        </div>

        <!-- Items -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems.map(item => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${formatPrice(item.price)}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="text-align: right; margin-bottom: 30px;">
          <p style="margin: 5px 0;">Subtotal: ${formatPrice(selectedOrder.subtotal)}</p>
          ${selectedOrder.shipping_cost > 0 ? `<p style="margin: 5px 0;">Shipping: ${formatPrice(selectedOrder.shipping_cost)}</p>` : ''}
          ${selectedOrder.discount > 0 ? `<p style="margin: 5px 0; color: green;">Discount: -${formatPrice(selectedOrder.discount)}</p>` : ''}
          ${selectedOrder.tax > 0 ? `<p style="margin: 5px 0;">Tax: ${formatPrice(selectedOrder.tax)}</p>` : ''}
          <p style="margin: 10px 0; font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px;">
            Total: ${formatPrice(selectedOrder.total)}
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p>Thank you for shopping with NOIR925!</p>
          <p>For queries: ${siteContact?.email || 'support@noir925.com'} | ${siteContact?.phone || ''}</p>
        </div>
      </div>
    `;
  };

  const downloadInvoice = () => {
    const invoiceHTML = generateInvoiceHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${selectedOrder?.order_number}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>${invoiceHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const sendInvoiceEmail = async () => {
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
          to: customerEmail,
          subject: `Invoice for Order ${selectedOrder.order_number} - NOIR925`,
          html: generateInvoiceHTML(),
        },
      });

      if (error) throw error;

      toast({
        title: "Invoice sent",
        description: "Invoice email sent to customer",
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: "Failed to send invoice email",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                      <Mail className="w-4 h-4 mr-2" />
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

                <TabsContent value="invoice" className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <Button onClick={downloadInvoice}>
                      <Download className="w-4 h-4 mr-2" />
                      Download/Print Invoice
                    </Button>
                    <Button variant="outline" onClick={sendInvoiceEmail} disabled={sendingEmail}>
                      <Mail className="w-4 h-4 mr-2" />
                      {sendingEmail ? 'Sending...' : 'Email Invoice'}
                    </Button>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div 
                        className="border rounded-lg p-4 bg-white"
                        dangerouslySetInnerHTML={{ __html: generateInvoiceHTML() }}
                      />
                    </CardContent>
                  </Card>
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