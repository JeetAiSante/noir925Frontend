import { Truck, Shield, RotateCcw, CreditCard, Zap, Award } from 'lucide-react';

const TrustStrip = () => {
  const trustItems = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Orders above ₹2,999',
    },
    {
      icon: Award,
      title: 'Hallmarked 925',
      description: 'BIS Certified Silver',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '7-Day Return Policy',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: '100% Protected',
    },
    {
      icon: Zap,
      title: 'Express Delivery',
      description: '2-4 Business Days',
    },
    {
      icon: CreditCard,
      title: 'EMI Available',
      description: 'No Cost EMI',
    },
  ];

  return (
    <section className="bg-muted/50 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide py-6 gap-8 md:gap-0 md:grid md:grid-cols-6">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 min-w-[140px] md:min-w-0 px-4 md:px-0 md:py-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-background shadow-soft flex items-center justify-center group-hover:shadow-medium group-hover:scale-110 transition-all duration-300">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-display text-sm font-medium text-foreground">{item.title}</p>
                <p className="font-body text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
