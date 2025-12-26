import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Image, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScheduledItem {
  id: string;
  name: string;
  type: 'banner';
  status: 'active' | 'scheduled' | 'expired' | 'inactive';
  startDate: string | null;
  endDate: string | null;
}

const SchedulingWidget = () => {
  // Fetch banners with scheduling
  const { data: banners = [] } = useQuery({
    queryKey: ['scheduled-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('id, title, start_date, end_date, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const now = new Date();

  const getStatus = (startDate: string | null, endDate: string | null, isActive: boolean): 'active' | 'scheduled' | 'expired' | 'inactive' => {
    if (!isActive) return 'inactive';
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && start > now) return 'scheduled';
    if (end && end < now) return 'expired';
    return 'active';
  };

  const scheduledItems: ScheduledItem[] = banners.map(b => ({
    id: b.id,
    name: b.title,
    type: 'banner' as const,
    status: getStatus(b.start_date, b.end_date, true),
    startDate: b.start_date,
    endDate: b.end_date,
  })).filter(item => item.status === 'scheduled' || item.status === 'active' || item.status === 'expired');

  const activeItems = scheduledItems.filter(i => i.status === 'active');
  const upcomingItems = scheduledItems.filter(i => i.status === 'scheduled');
  const expiredItems = scheduledItems.filter(i => i.status === 'expired').slice(0, 3);

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Scheduled Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Now */}
        {activeItems.length > 0 && (
          <div>
            <p className="text-xs font-medium text-green-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Currently Active
            </p>
            <div className="space-y-2">
              {activeItems.map(item => (
                <Link 
                  key={item.id} 
                  to="/admin/banners"
                  className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
                >
                  <Image className="w-4 h-4 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.endDate ? `Ends: ${formatDate(item.endDate)}` : 'No end date'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcomingItems.length > 0 && (
          <div>
            <p className="text-xs font-medium text-blue-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Upcoming
            </p>
            <div className="space-y-2">
              {upcomingItems.map(item => (
                <Link 
                  key={item.id} 
                  to="/admin/banners"
                  className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  <Image className="w-4 h-4 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Starts: {formatDate(item.startDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Expired */}
        {expiredItems.length > 0 && (
          <div>
            <p className="text-xs font-medium text-amber-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Recently Expired
            </p>
            <div className="space-y-2">
              {expiredItems.map(item => (
                <Link 
                  key={item.id} 
                  to="/admin/banners"
                  className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                >
                  <Image className="w-4 h-4 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Ended: {formatDate(item.endDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {scheduledItems.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No scheduled content</p>
            <Link to="/admin/banners" className="text-xs text-primary hover:underline">
              Create a banner
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchedulingWidget;
