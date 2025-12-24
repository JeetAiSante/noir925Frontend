import { Shield, Award, Truck, RotateCcw, CreditCard, Headphones } from 'lucide-react';

const TrustCertificationBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: 'BIS Hallmarked',
      description: '100% certified 925 silver',
      color: 'primary',
    },
    {
      icon: Award,
      title: 'ISO Certified',
      description: 'Quality management system',
      color: 'accent',
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Orders above ₹2,999',
      color: 'primary',
    },
    {
      icon: RotateCcw,
      title: '30-Day Returns',
      description: 'Hassle-free returns',
      color: 'accent',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: '256-bit SSL encryption',
      color: 'primary',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Dedicated customer care',
      color: 'accent',
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl mb-2">Why Choose NOIR925?</h2>
          <p className="font-body text-muted-foreground">Trusted by 50,000+ customers across India</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge, i) => (
            <div 
              key={i}
              className="group bg-background rounded-xl p-5 text-center border border-border/50 hover:border-primary/30 hover:shadow-medium transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 transition-colors ${
                badge.color === 'primary' 
                  ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' 
                  : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground'
              }`}>
                <badge.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-sm font-semibold mb-1">{badge.title}</h3>
              <p className="font-body text-xs text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>

        {/* Certification Logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-8 h-8" />
            <div className="text-left">
              <p className="font-display text-sm font-semibold">BIS Hallmark</p>
              <p className="text-xs">Govt. of India</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border hidden md:block" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="w-8 h-8" />
            <div className="text-left">
              <p className="font-display text-sm font-semibold">ISO 9001:2015</p>
              <p className="text-xs">Certified</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border hidden md:block" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="w-8 h-8" />
            <div className="text-left">
              <p className="font-display text-sm font-semibold">PCI DSS</p>
              <p className="text-xs">Compliant</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustCertificationBadges;
