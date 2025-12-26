import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, MapPin, Clock, Box, Home } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { SEOHead } from '@/components/seo/SEOHead';

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
  total: number;
  shipping_address: any;
  items: OrderItem[];
}

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const trackOrderSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Track Your Order - NOIR925",
    "description": "Track your NOIR925 silver jewellery order. Get real-time updates on your shipment status.",
    "url": "https://noir925.com/track-order",
    "mainEntity": {
      "@type": "WebApplication",
      "name": "NOIR925 Order Tracking",
      "applicationCategory": "ShoppingApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      }
    }
  };

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

      // Fetch order items
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      setOrderDetails({
        ...order,
        items: items || []
      });
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Unable to track order. Please try again.');
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }
    await handleTrackOrder(orderNumber);
  };

  const getStatusTimeline = (status: string, createdAt: string) => {
    const orderDate = new Date(createdAt);
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'in_transit', 'delivered'];
    const currentIndex = statuses.indexOf(status.toLowerCase());

    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    return [
      { status: 'Order Placed', date: orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), completed: currentIndex >= 0, current: currentIndex === 0, icon: Package },
      { status: 'Confirmed', date: addDays(orderDate, 0).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), completed: currentIndex >= 1, current: currentIndex === 1, icon: CheckCircle },
      { status: 'Processing', date: addDays(orderDate, 1).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), completed: currentIndex >= 2, current: currentIndex === 2, icon: Box },
      { status: 'Shipped', date: currentIndex >= 3 ? addDays(orderDate, 2).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Expected', completed: currentIndex >= 3, current: currentIndex === 3, icon: Truck },
      { status: 'In Transit', date: currentIndex >= 4 ? addDays(orderDate, 4).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Expected', completed: currentIndex >= 4, current: currentIndex === 4, icon: MapPin },
      { status: 'Delivered', date: currentIndex >= 5 ? addDays(orderDate, 7).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : `Expected ${addDays(orderDate, 7).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`, completed: currentIndex >= 5, current: currentIndex === 5, icon: Home },
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-500/10 text-green-600';
      case 'shipped':
      case 'in_transit': return 'bg-blue-500/10 text-blue-600';
      case 'processing': return 'bg-yellow-500/10 text-yellow-600';
      case 'cancelled': return 'bg-red-500/10 text-red-600';
      default: return 'bg-primary/10 text-primary';
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
          {orderDetails && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{orderDetails.order_number}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {new Date(orderDetails.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium w-fit ${getStatusColor(orderDetails.status)}`}>
                    <Truck className="w-4 h-4" />
                    {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Items */}
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <img 
                      src={item.product_image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100'} 
                      alt={item.product_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                ))}

                {/* Timeline */}
                <div className="relative">
                  <h3 className="font-display text-lg mb-4">Shipment Progress</h3>
                  <div className="space-y-4">
                    {getStatusTimeline(orderDetails.status, orderDetails.created_at).map((step, index, arr) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              step.completed 
                                ? step.current 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-primary/20 text-primary' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <StepIcon className="w-5 h-5" />
                            </div>
                            {index < arr.length - 1 && (
                              <div className={`w-0.5 h-8 ${
                                step.completed ? 'bg-primary/30' : 'bg-muted'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className={`font-medium ${step.current ? 'text-primary' : 'text-foreground'}`}>
                              {step.status}
                            </p>
                            <p className="text-sm text-muted-foreground">{step.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Address - Masked for privacy */}
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
              </CardContent>
            </Card>
          )}

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
