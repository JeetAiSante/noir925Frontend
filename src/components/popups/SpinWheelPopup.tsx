import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, X, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
  { label: '5% OFF', value: 'SPIN5', discount: 5, color: '#f43f5e' },
  { label: '10% OFF', value: 'SPIN10', discount: 10, color: '#a855f7' },
  { label: 'Try Again', value: '', discount: 0, color: '#6b7280' },
  { label: '15% OFF', value: 'SPIN15', discount: 15, color: '#3b82f6' },
  { label: 'Free Ship', value: 'FREESHIP', discount: 0, color: '#22c55e' },
  { label: '20% OFF', value: 'SPIN20', discount: 20, color: '#eab308' },
  { label: 'Try Again', value: '', discount: 0, color: '#6b7280' },
  { label: '25% OFF', value: 'SPIN25', discount: 25, color: '#ec4899' },
];

const SpinWheelPopup = ({ open, onOpenChange }: SpinWheelPopupProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  // Draw wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

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
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + (segmentAngle / 2) * (Math.PI / 180));
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(segment.label, radius - 20, 4);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, []);

  const spinWheel = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Calculate winning segment (weighted towards lower discounts)
    const weights = [20, 15, 25, 10, 15, 5, 25, 5]; // Higher weight = more likely
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

    // Calculate rotation to land on winning segment
    const spins = 5; // Number of full rotations
    const targetRotation = spins * 360 + (360 - winningIndex * segmentAngle - segmentAngle / 2);
    
    setRotation(prev => prev + targetRotation);

    // Wait for animation to complete
    setTimeout(async () => {
      const winner = WHEEL_SEGMENTS[winningIndex];
      setResult(winner);
      setIsSpinning(false);

      // Save to database
      if (user && winner.value) {
        try {
          await supabase.from('spin_wheel_history' as any).insert({
            user_id: user.id,
            prize: winner.label,
            coupon_code: winner.value,
            discount_percent: winner.discount,
          });
        } catch (error) {
          console.error('Error saving spin result:', error);
        }
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
    }, 5000);
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
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-background to-muted border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2 font-display text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Spin & Win!
            <Gift className="w-5 h-5 text-secondary" />
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {/* Wheel Container */}
          <div className="relative">
            {/* Pointer */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
            </div>

            {/* Spinning Wheel */}
            <motion.div
              className="relative"
              animate={{ rotate: rotation }}
              transition={{ duration: 5, ease: [0.17, 0.67, 0.12, 0.99] }}
            >
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="drop-shadow-xl"
              />
            </motion.div>

            {/* Center Button */}
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSpinning ? '...' : 'SPIN'}
            </button>
          </div>

          {/* Result Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 w-full text-center"
              >
                {result.value ? (
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                    <p className="font-display text-lg text-primary mb-2">
                      You Won {result.label}!
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="bg-background px-4 py-2 rounded-lg font-mono text-lg border">
                        {result.value}
                      </code>
                      <Button size="icon" variant="ghost" onClick={copyCode}>
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Use this code at checkout!
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-muted-foreground">
                      No luck this time. Try again later!
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <p className="mt-6 text-sm text-muted-foreground text-center max-w-xs">
              Spin the wheel for a chance to win exclusive discounts on your next purchase!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpinWheelPopup;
