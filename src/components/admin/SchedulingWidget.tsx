import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Image, Palette, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScheduledItem {
  id: string;
  name: string;
  type: 'banner' | 'festival';
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

  // Fetch festival themes with scheduling
  const { data: festivals = [] } = useQuery({
    queryKey: ['scheduled-festivals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('festival_themes')
        .select('id, name, start_date, end_date, is_active')
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

  const scheduledItems: ScheduledItem[] = [
    ...banners.map(b => ({
      id: b.id,
      name: b.title,
      type: 'banner' as const,
      status: getStatus(b.start_date, b.end_date, true),
      startDate: b.start_date,
      endDate: b.end_date,
    })),
    ...festivals.filter(f => f.is_active).map(f => ({
      id: f.id,
      name: f.name,
      type: 'festival' as const,
      status: getStatus(f.start_date, f.end_date, f.is_active),
      startDate: f.start_date,
      endDate: f.end_date,
    })),
  ].filter(item => item.status === 'scheduled' || item.status === 'active' || item.status === 'expired');

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
              <CheckCircle className="w-3 h-3" /> Currently Active
            </p>
            <div className="space-y-2">
              {activeItems.slice(0, 3).map(item => (
                <Link 
                  key={item.id}
                  to={item.type === 'banner' ? '/admin/banners' : '/admin/themes'}
                  className="flex items-center gap-3 p-2 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors"
                >
                  {item.type === 'banner' ? (
                    <Image className="w-4 h-4 text-green-500" />
                  ) : (
                    <Palette className="w-4 h-4 text-green-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.endDate ? `Ends ${formatDate(item.endDate)}` : 'No end date'}
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
              <Clock className="w-3 h-3" /> Upcoming
            </p>
            <div className="space-y-2">
              {upcomingItems.map(item => (
                <Link 
                  key={item.id}
                  to={item.type === 'banner' ? '/admin/banners' : '/admin/themes'}
                  className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
                >
                  {item.type === 'banner' ? (
                    <Image className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Palette className="w-4 h-4 text-blue-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Starts {formatDate(item.startDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Expired (needs attention) */}
        {expiredItems.length > 0 && (
          <div>
            <p className="text-xs font-medium text-orange-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Expired
            </p>
            <div className="space-y-2">
              {expiredItems.map(item => (
                <Link 
                  key={item.id}
                  to={item.type === 'banner' ? '/admin/banners' : '/admin/themes'}
                  className="flex items-center gap-3 p-2 rounded-lg bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
                >
                  {item.type === 'banner' ? (
                    <Image className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Palette className="w-4 h-4 text-orange-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Ended {formatDate(item.endDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {scheduledItems.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No scheduled content
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchedulingWidget;
