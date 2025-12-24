import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CloudRain, Percent, Timer, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const MonsoonSaleBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary" />
      
      {/* Animated Rain Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-background/30 to-transparent animate-rain"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${30 + Math.random() * 50}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative Clouds */}
      <div className="absolute top-0 left-10 opacity-10">
        <CloudRain className="w-32 h-32 text-background" />
      </div>
      <div className="absolute bottom-0 right-10 opacity-10">
        <CloudRain className="w-24 h-24 text-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20 mb-4">
              <CloudRain className="w-4 h-4 text-background" />
              <span className="font-accent text-sm text-background tracking-wider">Monsoon Special</span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-background mb-4 leading-tight">
              Monsoon <span className="text-accent">Sale</span>
              <br />
              <span className="text-3xl md:text-4xl">Up to 50% Off</span>
            </h2>
            
            <p className="font-body text-background/80 text-lg mb-6 max-w-md mx-auto lg:mx-0">
              Let the rain bring shine to your collection. Exclusive monsoon discounts on our finest silver pieces.
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              {[
                { icon: Percent, text: 'Up to 50% Off' },
                { icon: Zap, text: 'Flash Deals' },
                { icon: Timer, text: 'Limited Time' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/10 text-background text-sm">
                  <item.icon className="w-4 h-4" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <Link to="/shop?sale=monsoon">
              <Button variant="hero" size="xl" className="group">
                Shop Monsoon Sale
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          </div>

          {/* Right - Countdown Timer */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-background/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-background/20">
              <p className="text-center text-background/80 font-accent text-sm tracking-wider mb-4">SALE ENDS IN</p>
              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Mins' },
                  { value: timeLeft.seconds, label: 'Secs' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-background rounded-xl p-3 md:p-4 shadow-lg">
                      <span className="font-display text-2xl md:text-4xl text-primary">
                        {String(item.value).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-background/70 text-xs md:text-sm mt-2 block">{item.label}</span>
                  </div>
                ))}
              </div>
              
              {/* Promo Code */}
              <div className="mt-6 p-3 bg-accent/20 rounded-lg text-center">
                <p className="text-background/80 text-sm mb-1">Use Code</p>
                <p className="font-display text-xl text-accent tracking-wider">MONSOON50</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rain {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-rain {
          animation: rain linear infinite;
        }
      `}</style>
    </section>
  );
};

export default MonsoonSaleBanner;
