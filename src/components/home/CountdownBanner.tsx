import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Gift, Percent } from 'lucide-react';

const CountdownBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set end date to 7 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Mins' },
    { value: timeLeft.seconds, label: 'Secs' },
  ];

  return (
    <section className="py-4 bg-gradient-to-r from-primary via-primary/90 to-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full rounded-full bg-primary-glow/20 blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full rounded-full bg-accent/20 blur-3xl animate-pulse-soft delay-300" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Offer Text */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-full bg-background/10 items-center justify-center">
              <Percent className="w-6 h-6 text-background" />
            </div>
            <div className="text-center md:text-left">
              <p className="font-accent text-xs text-background/80 tracking-widest uppercase">
                Limited Time Offer
              </p>
              <h3 className="font-display text-xl md:text-2xl text-background">
                Festive Sale - Up to 50% Off
              </h3>
            </div>
          </div>

          {/* Center - Countdown */}
          <div className="flex items-center gap-2 md:gap-4">
            <Clock className="w-5 h-5 text-background/80 hidden sm:block" />
            <div className="flex gap-2 md:gap-3">
              {timeBlocks.map((block, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-background/10 backdrop-blur-sm flex items-center justify-center border border-background/20">
                    <span className="font-display text-xl md:text-2xl text-background">
                      {String(block.value).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="font-body text-[10px] text-background/70 uppercase tracking-wider mt-1 block">
                    {block.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - CTA */}
          <Link to="/shop?sale=festive">
            <Button
              variant="hero"
              className="bg-background text-primary hover:bg-background/90 whitespace-nowrap"
            >
              <Gift className="w-4 h-4 mr-2" />
              Shop Sale
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CountdownBanner;
