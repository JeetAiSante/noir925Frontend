import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Copy, Check, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SpinWheelPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WheelSegment {
  label: string;
  value: string;
  discount: number;
  color: string;
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  { label: '5% OFF', value: 'SPIN5', discount: 5, color: 'hsl(350, 89%, 60%)' },
  { label: '10% OFF', value: 'SPIN10', discount: 10, color: 'hsl(270, 76%, 60%)' },
  { label: 'Try Again', value: '', discount: 0, color: 'hsl(220, 9%, 46%)' },
  { label: '15% OFF', value: 'SPIN15', discount: 15, color: 'hsl(217, 91%, 60%)' },
  { label: 'Free Ship', value: 'FREESHIP', discount: 0, color: 'hsl(142, 71%, 45%)' },
  { label: '20% OFF', value: 'SPIN20', discount: 20, color: 'hsl(48, 96%, 53%)' },
  { label: 'Try Again', value: '', discount: 0, color: 'hsl(220, 9%, 46%)' },
  { label: '25% OFF', value: 'SPIN25', discount: 25, color: 'hsl(330, 81%, 60%)' },
];

const SpinWheelPopup = ({ open, onOpenChange }: SpinWheelPopupProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    WHEEL_SEGMENTS.forEach((segment, index) => {
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
  }, [open]);

  const handleLoginRedirect = () => {
    onOpenChange(false);
    navigate('/auth', { state: { returnTo: window.location.pathname } });
  };

  const spinWheel = async () => {
    if (isSpinning || hasSpun) return;

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to spin the wheel and win prizes!',
      });
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // Calculate winning segment (weighted towards lower discounts)
    const weights = [20, 15, 25, 10, 15, 5, 25, 5];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let winningIndex = 0;

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        winningIndex = i;
        break;
      }
    }

    // Calculate rotation
    const spins = 5;
    const targetRotation = spins * 360 + (360 - winningIndex * segmentAngle - segmentAngle / 2);
    
    setRotation(prev => prev + targetRotation);

    // Wait for animation
    setTimeout(async () => {
      const winner = WHEEL_SEGMENTS[winningIndex];
      setResult(winner);
      setIsSpinning(false);
      setHasSpun(true);

      // Save to database
      try {
        await supabase.from('spin_wheel_history').insert({
          user_id: user.id,
          prize_type: winner.value ? 'discount' : 'try_again',
          prize_value: winner.label,
          coupon_code: winner.value || null,
          is_redeemed: false,
        });
      } catch (error) {
        console.error('Error saving spin result:', error);
      }

      if (winner.value) {
        toast({
          title: '🎉 Congratulations!',
          description: `You won ${winner.label}! Use code: ${winner.value}`,
        });
      } else {
        toast({
          title: 'Almost there!',
          description: 'Better luck next time!',
        });
      }
    }, 4000);
  };

  const copyCode = () => {
    if (result?.value) {
      navigator.clipboard.writeText(result.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
                variant="luxury"
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
                ) : (
                  <div className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      No luck this time. Try again tomorrow!
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
