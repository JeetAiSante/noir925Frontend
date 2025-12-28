import { useState } from 'react';
import { Award, Sparkles, Gift, TrendingUp, History, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserLoyaltyPoints, useLoyaltySettings } from '@/hooks/useLoyaltyPoints';
import { useCurrency } from '@/context/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';

const tierConfig = {
  bronze: { color: 'bg-amber-600', next: 'Silver', pointsNeeded: 500, icon: '🥉' },
  silver: { color: 'bg-gray-400', next: 'Gold', pointsNeeded: 2000, icon: '🥈' },
  gold: { color: 'bg-yellow-500', next: 'Platinum', pointsNeeded: 5000, icon: '🥇' },
  platinum: { color: 'bg-gradient-to-r from-purple-500 to-pink-500', next: null, pointsNeeded: 0, icon: '💎' },
};

const LoyaltyPointsCard = () => {
  const { user } = useAuth();
  const { data: loyaltyPoints, isLoading: pointsLoading } = useUserLoyaltyPoints();
  const { data: settings, isLoading: settingsLoading } = useLoyaltySettings();
  const { formatPrice } = useCurrency();
  const [showHistory, setShowHistory] = useState(false);

  // Fetch recent transactions
  const { data: transactions } = useQuery({
    queryKey: ['loyalty-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (!settings?.is_enabled) {
    return null;
  }

  if (pointsLoading || settingsLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const currentTier = (loyaltyPoints?.tier || 'bronze') as keyof typeof tierConfig;
  const tier = tierConfig[currentTier];
  const availablePoints = loyaltyPoints?.available_points || 0;
  const totalPoints = loyaltyPoints?.total_points || 0;
  const redeemedPoints = loyaltyPoints?.redeemed_points || 0;

  // Calculate progress to next tier
  const nextTierPoints = tier.pointsNeeded;
  const progressPercent = nextTierPoints > 0 
    ? Math.min((totalPoints / nextTierPoints) * 100, 100) 
    : 100;

  // Calculate monetary value
  const pointsValue = availablePoints * (settings?.points_value_per_rupee || 0.25);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${tier.color} flex items-center justify-center text-2xl`}>
              {tier.icon}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Loyalty Points
              </CardTitle>
              <CardDescription className="capitalize">{currentTier} Member</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg font-bold px-4 py-2">
            {availablePoints.toLocaleString()} pts
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Points Value */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Redeemable Value</p>
              <p className="text-xs text-muted-foreground">Use at checkout</p>
            </div>
          </div>
          <p className="text-xl font-bold text-primary">{formatPrice(pointsValue)}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-2xl font-bold">{redeemedPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Redeemed</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {tier.next && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Progress to {tier.next}
              </span>
              <span className="text-sm font-medium">{totalPoints}/{nextTierPoints}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Earn {(nextTierPoints - totalPoints).toLocaleString()} more points to unlock {tier.next}
            </p>
          </div>
        )}

        {/* How to Earn */}
        <div className="p-4 border border-dashed border-border rounded-xl">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            How to Earn Points
          </p>
          <p className="text-xs text-muted-foreground">
            Earn {settings?.points_per_rupee || 1} point for every ₹1 spent. 
            {settings?.welcome_bonus_points > 0 && ` New members get ${settings.welcome_bonus_points} bonus points!`}
          </p>
        </div>

        {/* Recent Transactions */}
        {transactions && transactions.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between py-2 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Activity
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
            </button>
            
            {showHistory && (
              <div className="space-y-2 mt-2">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
                    <div>
                      <p className="font-medium">{tx.description || tx.transaction_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`font-bold ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoyaltyPointsCard;
