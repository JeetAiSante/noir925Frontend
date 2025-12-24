import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock order data for demo
      if (orderNumber.startsWith('NOIR')) {
        setOrderDetails({
          orderNumber,
          status: 'In Transit',
          estimatedDelivery: 'Dec 28, 2024',
          items: [
            { name: 'Silver Infinity Ring', quantity: 1, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100' }
          ],
          timeline: [
            { status: 'Order Placed', date: 'Dec 20, 2024', completed: true },
            { status: 'Confirmed', date: 'Dec 20, 2024', completed: true },
            { status: 'Shipped', date: 'Dec 22, 2024', completed: true },
            { status: 'In Transit', date: 'Dec 24, 2024', completed: true, current: true },
            { status: 'Delivered', date: 'Expected Dec 28', completed: false },
          ]
        });
      } else {
        setError('Order not found. Please check your order number and try again.');
        setOrderDetails(null);
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
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
                    <CardTitle className="text-lg">Order #{orderDetails.orderNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Estimated Delivery: {orderDetails.estimatedDelivery}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium w-fit">
                    <Truck className="w-4 h-4" />
                    {orderDetails.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Items */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <img 
                    src={orderDetails.items[0].image} 
                    alt={orderDetails.items[0].name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{orderDetails.items[0].name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {orderDetails.items[0].quantity}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  <h3 className="font-display text-lg mb-4">Shipment Progress</h3>
                  <div className="space-y-4">
                    {orderDetails.timeline.map((step: any, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed 
                              ? step.current 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-primary/20 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-current" />
                            )}
                          </div>
                          {index < orderDetails.timeline.length - 1 && (
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
                    ))}
                  </div>
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
