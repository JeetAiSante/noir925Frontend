import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Gift, Percent, Zap, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TimerData {
  id: string;
  title: string;
  subtitle: string | null;
  end_time: string;
  link: string | null;
  is_active: boolean;
  bg_color: string | null;
  text_color: string | null;
  accent_color: string | null;
  button_text: string | null;
  icon_type: string | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  percent: Percent,
  gift: Gift,
  zap: Zap,
  star: Star,
};

const CountdownBanner = () => {
  const [timer, setTimer] = useState<TimerData | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  // Fetch active timer from database
  useEffect(() => {
    const fetchTimer = async () => {
      const { data, error } = await supabase
        .from('countdown_timers')
        .select('*')
        .eq('is_active', true)
        .eq('position', 'banner')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        // Type assertion for new columns that may not be in generated types yet
        setTimer(data as TimerData);
      }
    };

    fetchTimer();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('countdown_timer_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'countdown_timers' },
        () => {
          fetchTimer();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!timer) return;

    const endDate = new Date(timer.end_time);

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Don't render if no active timer or expired
  if (!timer || isExpired) return null;

  // Get colors with fallbacks
  const bgColor = timer.bg_color || '#1a472a';
  const textColor = timer.text_color || '#ffffff';
  const accentColor = timer.accent_color || '#c9a962';
  const buttonText = timer.button_text || 'Shop Sale';
  const IconComponent = iconMap[timer.icon_type || 'percent'] || Percent;

  const timeBlocks = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Mins' },
    { value: timeLeft.seconds, label: 'Secs' },
  ];

  return (
    <section 
      className="py-4 relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
      aria-label="Limited time offer countdown"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div 
          className="absolute -top-1/2 -left-1/4 w-1/2 h-full rounded-full blur-3xl animate-pulse-soft" 
          style={{ backgroundColor: `${accentColor}20` }}
        />
        <div 
          className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full rounded-full blur-3xl animate-pulse-soft delay-300" 
          style={{ backgroundColor: `${accentColor}20` }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Offer Text */}
          <div className="flex items-center gap-4">
            <div 
              className="hidden sm:flex w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: `${textColor}15` }}
            >
              <IconComponent className="w-6 h-6" style={{ color: textColor }} aria-hidden="true" />
            </div>
            <div className="text-center md:text-left">
              <p 
                className="font-accent text-xs tracking-widest uppercase"
                style={{ color: `${textColor}cc` }}
              >
                {timer.subtitle || 'Limited Time Offer'}
              </p>
              <h3 
                className="font-display text-xl md:text-2xl"
                style={{ color: textColor }}
              >
                {timer.title}
              </h3>
            </div>
          </div>

          {/* Center - Countdown */}
          <div className="flex items-center gap-2 md:gap-4">
            <Clock 
              className="w-5 h-5 hidden sm:block" 
              style={{ color: `${textColor}cc` }}
              aria-hidden="true"
            />
            <div className="flex gap-2 md:gap-3" role="timer" aria-label="Time remaining">
              {timeBlocks.map((block, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-lg backdrop-blur-sm flex items-center justify-center border"
                    style={{ 
                      backgroundColor: `${textColor}15`,
                      borderColor: `${textColor}30`
                    }}
                  >
                    <span 
                      className="font-display text-xl md:text-2xl"
                      style={{ color: textColor }}
                      aria-label={`${block.value} ${block.label.toLowerCase()}`}
                    >
                      {String(block.value).padStart(2, '0')}
                    </span>
                  </div>
                  <span 
                    className="font-body text-[10px] uppercase tracking-wider mt-1 block"
                    style={{ color: `${textColor}99` }}
                  >
                    {block.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - CTA */}
          <Link to={timer.link || '/shop'} aria-label={`${buttonText} - ${timer.title}`}>
            <Button
              className="whitespace-nowrap gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
              style={{
                backgroundColor: textColor,
                color: bgColor,
              }}
            >
              <Gift className="w-4 h-4" aria-hidden="true" />
              {buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CountdownBanner;
