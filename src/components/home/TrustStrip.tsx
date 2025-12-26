import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Shield, RotateCcw, CreditCard, Zap, Award } from 'lucide-react';

interface TrustBadge {
  id: string;
  icon: string;
  title: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  Shield,
  RotateCcw,
  CreditCard,
  Zap,
  Award,
};

const defaultBadges: TrustBadge[] = [
  { id: '1', icon: 'Truck', title: 'Free Shipping', description: 'Orders above ₹2,999', is_active: true, sort_order: 0 },
  { id: '2', icon: 'Award', title: 'Hallmarked 925', description: 'BIS Certified Silver', is_active: true, sort_order: 1 },
  { id: '3', icon: 'RotateCcw', title: 'Easy Returns', description: '7-Day Return Policy', is_active: true, sort_order: 2 },
  { id: '4', icon: 'Shield', title: 'Secure Payments', description: '100% Protected', is_active: true, sort_order: 3 },
  { id: '5', icon: 'Zap', title: 'Express Delivery', description: '2-4 Business Days', is_active: true, sort_order: 4 },
  { id: '6', icon: 'CreditCard', title: 'EMI Available', description: 'No Cost EMI', is_active: true, sort_order: 5 },
];

const TrustStrip = () => {
  const [trustItems, setTrustItems] = useState<TrustBadge[]>(defaultBadges);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'trust_badges')
          .single();

        if (data?.value) {
          const badges = typeof data.value === 'string' 
            ? JSON.parse(data.value) 
            : data.value;
          
          if (Array.isArray(badges) && badges.length > 0) {
            setTrustItems(badges.filter((b: TrustBadge) => b.is_active).sort((a: TrustBadge, b: TrustBadge) => a.sort_order - b.sort_order));
          }
        }
      } catch (error) {
        console.error('Error fetching trust badges:', error);
      }
    };

    fetchBadges();
  }, []);

  if (trustItems.length === 0) return null;

  return (
    <section 
      className="bg-muted/50 border-y border-border"
      aria-label="Trust and certification badges"
    >
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide py-6 gap-8 md:gap-0 md:grid md:grid-cols-6">
          {trustItems.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Shield;
            return (
              <div
                key={item.id || index}
                className="flex flex-col items-center gap-2 min-w-[140px] md:min-w-0 px-4 md:px-0 md:py-2 group"
              >
                <div 
                  className="w-12 h-12 rounded-full bg-background shadow-soft flex items-center justify-center group-hover:shadow-medium group-hover:scale-110 transition-all duration-300"
                  role="img"
                  aria-label={item.title}
                >
                  <IconComponent className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div className="text-center">
                  <p className="font-display text-sm font-medium text-foreground">{item.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
