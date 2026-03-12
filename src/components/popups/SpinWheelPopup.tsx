import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Copy, Check, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface SpinWheelPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WheelSegment {
  id: string;
  label: string;
  value: string;
  discount_percent: number | null;
  color: string;
  weight: number;
}

const SpinWheelPopup = ({ open, onOpenChange }: SpinWheelPopupProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [prizes, setPrizes] = useState<WheelSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch prizes from database via secure RPC (no coupon codes exposed)
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_spin_wheel_display_prizes');

        if (!error && data && data.length > 0) {
          setPrizes(data.map((p: any) => ({
            id: p.id,
            label: p.label,
            value: '', // codes not exposed to client
            discount_percent: p.discount_percent,
            color: p.color,
            weight: p.weight,
          })));
        } else {
          // Fallback to default prizes
          setPrizes([
            { id: '1', label: '5% OFF', value: '', discount_percent: 5, color: '#e63946', weight: 20 },
            { id: '2', label: '10% OFF', value: '', discount_percent: 10, color: '#9d4edd', weight: 15 },
            { id: '3', label: 'Try Again', value: '', discount_percent: null, color: '#6b7280', weight: 25 },
            { id: '4', label: '15% OFF', value: '', discount_percent: 15, color: '#3b82f6', weight: 10 },
            { id: '5', label: 'Free Ship', value: '', discount_percent: null, color: '#22c55e', weight: 15 },
            { id: '6', label: '20% OFF', value: '', discount_percent: 20, color: '#eab308', weight: 5 },
            { id: '7', label: 'Try Again', value: '', discount_percent: null, color: '#6b7280', weight: 25 },
            { id: '8', label: '25% OFF', value: '', discount_percent: 25, color: '#ec4899', weight: 5 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching prizes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchPrizes();
    }
  }, [open]);

  const segmentAngle = prizes.length > 0 ? 360 / prizes.length : 45;

  // Check if user already spun today
  useEffect(() => {
    const checkSpinHistory = async () => {
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('spin_wheel_history')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .limit(1);
      
      if (data && data.length > 0) {
        setHasSpun(true);
      }
    };
    
    if (open) {
      checkSpinHistory();
    }
  }, [open, user]);

  // Draw wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    prizes.forEach((segment, index) => {
      const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + (segmentAngle / 2) * (Math.PI / 180));
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px system-ui';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 2;
      ctx.fillText(segment.label, radius - 15, 3);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fill();
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [open, prizes, segmentAngle]);

  const handleLoginRedirect = () => {
    onOpenChange(false);
    navigate('/auth', { state: { returnTo: window.location.pathname } });
  };

  const spinWheel = async () => {
    if (isSpinning || hasSpun || prizes.length === 0) return;

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to spin the wheel and win prizes!',
      });
      return;
    }

    setIsSpinning(true);
    setResult(null);

    try {
      // Perform spin server-side (validates limits, selects prize, records history)
      const { data: spinResult, error: spinError } = await supabase
        .rpc('perform_spin', { _user_id: user.id });

      if (spinError) {
        throw new Error(spinError.message);
      }

      const serverPrize = spinResult?.[0];
      if (!serverPrize) throw new Error('No prize returned');

      // Find matching prize index for wheel animation
      const winningIndex = prizes.findIndex(p => p.label === serverPrize.prize_label);
      const targetIndex = winningIndex >= 0 ? winningIndex : 0;

      // Calculate rotation
      const spins = 5;
      const targetRotation = spins * 360 + (360 - targetIndex * segmentAngle - segmentAngle / 2);
      
      setRotation(prev => prev + targetRotation);

      // Wait for animation
      setTimeout(() => {
        const winnerSegment: WheelSegment = {
          ...prizes[targetIndex],
          value: serverPrize.coupon_code || '',
        };
        setResult(winnerSegment);
        setIsSpinning(false);
        setHasSpun(true);
        
        localStorage.setItem('spinWheelLastSpin', new Date().toISOString());

        if (serverPrize.coupon_code) {
          toast({
            title: '🎉 Congratulations!',
            description: `You won ${serverPrize.prize_label}! Use code: ${serverPrize.coupon_code}`,
          });
        } else {
          toast({
            title: 'Almost there!',
            description: 'Better luck next time!',
          });
        }
      }, 4000);
    } catch (error: any) {
      setIsSpinning(false);
      toast({
        title: 'Spin Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyCode = () => {
    if (result?.value) {
      navigator.clipboard.writeText(result.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[340px] p-6 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[340px] p-0 overflow-hidden bg-gradient-to-b from-card to-background border-primary/30 rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg">Spin & Win!</h2>
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Try your luck for exclusive discounts</p>
        </div>

        <div className="p-4">
          {/* Wheel Container */}
          <div className="relative flex justify-center">
            {/* Pointer */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
            </div>

            {/* Spinning Wheel */}
            <motion.div
              className="relative"
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
            >
              <canvas
                ref={canvasRef}
                width={220}
                height={220}
                className="drop-shadow-xl rounded-full"
              />
            </motion.div>

            {/* Center Button */}
            <button
              onClick={user ? spinWheel : handleLoginRedirect}
              disabled={isSpinning || hasSpun}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-[10px] uppercase tracking-wider shadow-lg hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSpinning ? '...' : hasSpun ? '✓' : 'SPIN'}
            </button>
          </div>

          {/* Login Prompt for non-logged in users */}
          {!user && !result && (
            <div className="mt-4 text-center">
              <Button 
                onClick={handleLoginRedirect}
                className="gap-2"
                variant="default"
                size="sm"
              >
                <LogIn className="w-4 h-4" />
                Login to Spin
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Sign in to spin the wheel and win prizes!
              </p>
            </div>
          )}

          {/* Already Spun Message */}
          {hasSpun && !result && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                You've already spun today! Come back tomorrow.
              </p>
            </div>
          )}

          {/* Result Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                {result.value ? (
                  result.value === 'FREESHIP' ? (
                    // Free Shipping Result
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                      <p className="font-display text-green-600 dark:text-green-400 mb-2">
                        🚚 Free Shipping Won!
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Enjoy free shipping on your next order
                      </p>
                      <Link to="/shop">
                        <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                          <Sparkles className="w-3 h-3" />
                          Shop Now
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    // Discount Code Result
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-center">
                      <p className="font-display text-primary mb-2">
                        🎉 You Won {result.label}!
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="bg-background px-3 py-1.5 rounded-lg font-mono text-sm border">
                          {result.value}
                        </code>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyCode}>
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Use this code at checkout!
                      </p>
                    </div>
                  )
                ) : (
                  // Better Luck Message
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="font-display text-lg text-foreground mb-1">
                      😔 Better Luck Next Time!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Come back tomorrow for another spin
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {user && !result && !hasSpun && (
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Spin the wheel for a chance to win exclusive discounts!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpinWheelPopup;
