import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, MapPin, Clock, Box, Home, Bell, RefreshCw, Mail, MessageSquare } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { SEOHead } from '@/components/seo/SEOHead';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  total: number;
  shipping_address: any;
  items: OrderItem[];
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package, color: 'text-amber-500' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
  { key: 'processing', label: 'Packed', icon: Box, color: 'text-purple-500' },
  { key: 'shipped', label: 'Shipped', icon: Truck, color: 'text-indigo-500' },
  { key: 'in_transit', label: 'In Transit', icon: MapPin, color: 'text-cyan-500' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'text-teal-500' },
  { key: 'delivered', label: 'Delivered', icon: Home, color: 'text-green-500' },
];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user } = useAuth();

  const trackOrderSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Track Your Order - NOIR925",
    "description": "Track your NOIR925 silver jewellery order. Get real-time updates on your shipment status.",
    "url": "https://noir925.com/track-order"
  };

  // Setup realtime subscription for order updates
  useEffect(() => {
    if (!orderDetails?.id) return;

    const channel = supabase
      .channel(`order-${orderDetails.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderDetails.id}`
        },
        (payload) => {
          console.log('Order updated:', payload);
          const newStatus = (payload.new as any).status;
          if (newStatus !== orderDetails.status) {
            setOrderDetails(prev => prev ? { ...prev, status: newStatus, updated_at: (payload.new as any).updated_at } : null);
            setLastUpdated(new Date());
            toast.success(`Order status updated to: ${newStatus.replace('_', ' ').toUpperCase()}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderDetails?.id]);

  useEffect(() => {
    const orderFromUrl = searchParams.get('order');
    if (orderFromUrl) {
      setOrderNumber(orderFromUrl);
      handleTrackOrder(orderFromUrl);
    }
  }, [searchParams]);

  const handleTrackOrder = async (orderNum: string) => {
    setError('');
    setIsLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNum.toUpperCase())
        .maybeSingle();

      if (orderError) throw orderError;

      if (!order) {
        setError('Order not found. Please check your order number and try again.');
        setOrderDetails(null);
        setIsLoading(false);
        return;
      }

      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      setOrderDetails({
        ...order,
        items: items || []
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Unable to track order. Please try again.');
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!orderDetails?.order_number) return;
    setIsRefreshing(true);
    await handleTrackOrder(orderDetails.order_number);
    setIsRefreshing(false);
  }, [orderDetails?.order_number]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }
    await handleTrackOrder(orderNumber);
  };

  const getCurrentStepIndex = (status: string) => {
    const index = statusSteps.findIndex(s => s.key === status.toLowerCase());
    return index >= 0 ? index : 0;
  };

  const getEstimatedDate = (createdAt: string, daysToAdd: number) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'out_for_delivery': return 'bg-teal-500/10 text-teal-600 border-teal-500/30';
      case 'in_transit':
      case 'shipped': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'processing': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'confirmed': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/30';
      default: return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Track Your Order - NOIR925 Silver Jewellery"
        description="Track your NOIR925 order status. Get real-time updates on your premium 925 sterling silver jewellery shipment."
        keywords="track order, order status, NOIR925 order tracking, silver jewellery delivery, shipment tracking India"
        canonicalUrl="https://noir925.com/track-order"
        noIndex={false}
        structuredData={trackOrderSchema}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-4xl text-foreground mb-2">
              Track Your Order
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Enter your order number to see the latest status
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="orderNumber"
                      type="text"
                      placeholder="e.g., NOIR123456789"
                      value={orderNumber}
                      onChange={(e) => {
                        setOrderNumber(e.target.value.toUpperCase());
                        setError('');
                      }}
                      className={`pl-10 h-12 ${error ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Tracking...
                    </span>
                  ) : (
                    'Track Order'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Details */}
          <AnimatePresence>
            {orderDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Order #{orderDetails.order_number}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                          >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                          </Button>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Placed on {new Date(orderDetails.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        {lastUpdated && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Bell className="w-3 h-3" />
                            Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
                          </p>
                        )}
                      </div>
                      <Badge className={`text-sm px-4 py-2 border ${getStatusColor(orderDetails.status)}`}>
                        {orderDetails.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-6">
                    {/* Visual Progress Bar */}
                    <div className="relative">
                      <h3 className="font-display text-lg mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Tracking Progress
                      </h3>
                      
                      {/* Progress Steps */}
                      <div className="relative">
                        <div className="absolute top-5 left-5 right-5 h-1 bg-muted rounded-full">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(getCurrentStepIndex(orderDetails.status) / (statusSteps.length - 1)) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                        
                        <div className="relative flex justify-between">
                          {statusSteps.map((step, index) => {
                            const currentIndex = getCurrentStepIndex(orderDetails.status);
                            const isCompleted = index <= currentIndex;
                            const isCurrent = index === currentIndex;
                            const StepIcon = step.icon;
                            
                            return (
                              <div key={step.key} className="flex flex-col items-center" style={{ width: '14%' }}>
                                <motion.div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isCompleted
                                      ? isCurrent
                                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30'
                                        : 'bg-primary/20 text-primary border-primary/50'
                                      : 'bg-muted text-muted-foreground border-muted-foreground/30'
                                  }`}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <StepIcon className="w-4 h-4" />
                                </motion.div>
                                <p className={`text-[10px] mt-2 text-center font-medium ${
                                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {step.label}
                                </p>
                                {isCurrent && (
                                  <p className="text-[9px] text-primary mt-0.5">
                                    {orderDetails.status === 'delivered' ? 'Complete' : 'Current'}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Estimated Delivery */}
                      {orderDetails.status !== 'delivered' && orderDetails.status !== 'cancelled' && (
                        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
                          <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                          <p className="text-lg font-semibold text-primary">
                            {getEstimatedDate(orderDetails.created_at, 5)} - {getEstimatedDate(orderDetails.created_at, 7)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="font-medium mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {orderDetails.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            <img 
                              src={item.product_image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100'} 
                              alt={item.product_name}
                              className="w-14 h-14 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{item.product_name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">₹{item.price.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {orderDetails.shipping_address && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          Delivery Address
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {orderDetails.shipping_address.full_name}<br />
                          {orderDetails.shipping_address.address_line1?.substring(0, 10)}***<br />
                          {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.postal_code?.substring(0, 3)}***
                        </p>
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-medium">Order Total</span>
                      <span className="text-xl font-bold text-primary">₹{orderDetails.total.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Notification Preferences */}
                    <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" />
                        Get Notified
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Receive updates about your order via email
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          Email Updates
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Section */}
          <div className="text-center mt-8 p-6 bg-muted/50 rounded-xl">
            <p className="text-muted-foreground mb-2">
              Can't find your order or need help?
            </p>
            <a href="/contact" className="text-primary hover:underline font-medium">
              Contact Customer Support
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TrackOrder;
