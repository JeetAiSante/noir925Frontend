import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Mail, Send, Plus, ShoppingCart, Bell, Megaphone, 
  Eye, Trash2, Clock, Users, BarChart3, TrendingUp 
} from 'lucide-react';

const AdminMarketing = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '', subject: '', content: '', campaign_type: 'general', target_audience: 'all'
  });
  const [showCreateNotification, setShowCreateNotification] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '', body: '', url: '', notification_type: 'general'
  });

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch abandoned carts
  const { data: abandonedCarts = [], isLoading: cartsLoading } = useQuery({
    queryKey: ['abandoned-carts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('is_recovered', false)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch push notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['push-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch push subscription count
  const { data: subCount = 0 } = useQuery({
    queryKey: ['push-sub-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    },
  });

  // Create campaign
  const createCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('marketing_campaigns').insert({
        name: newCampaign.name,
        subject: newCampaign.subject,
        content: newCampaign.content,
        campaign_type: newCampaign.campaign_type,
        target_audience: newCampaign.target_audience,
        status: 'draft',
        type: 'email',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      setShowCreateCampaign(false);
      setNewCampaign({ name: '', subject: '', content: '', campaign_type: 'general', target_audience: 'all' });
      toast.success('Campaign created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Send campaign
  const sendCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase.functions.invoke('send-campaign', {
        body: { campaign_id: campaignId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success(data?.message || 'Campaign sent');
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Delete campaign
  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('marketing_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign deleted');
    },
  });

  // Trigger abandoned cart emails
  const triggerAbandonedEmails = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('abandoned-cart-email');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
      toast.success(data?.message || 'Abandoned cart emails processed');
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Create notification
  const createNotification = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('push_notifications').insert({
        title: newNotification.title,
        body: newNotification.body,
        url: newNotification.url || null,
        notification_type: newNotification.notification_type,
        status: 'draft',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-notifications'] });
      setShowCreateNotification(false);
      setNewNotification({ title: '', body: '', url: '', notification_type: 'general' });
      toast.success('Notification created');
    },
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('push_notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-notifications'] });
      toast.success('Notification deleted');
    },
  });

  const campaignTypeLabels: Record<string, string> = {
    general: 'General', abandoned_cart: 'Abandoned Cart', festival: 'Festival',
    coupon: 'Coupon', product_launch: 'Product Launch',
  };

  const statusColors: Record<string, string> = {
    draft: 'secondary', sending: 'default', sent: 'default', failed: 'destructive',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display">Marketing Hub</h1>
          <p className="text-sm text-muted-foreground">Email campaigns, abandoned carts & push notifications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Megaphone className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Campaigns</p>
                <p className="text-xl font-bold">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg"><ShoppingCart className="w-5 h-5 text-destructive" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Abandoned Carts</p>
                <p className="text-xl font-bold">{abandonedCarts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg"><Bell className="w-5 h-5 text-accent-foreground" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Notifications</p>
                <p className="text-xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/50 rounded-lg"><Users className="w-5 h-5 text-secondary-foreground" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Push Subscribers</p>
                <p className="text-xl font-bold">{subCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
          <TabsTrigger value="campaigns" className="gap-2"><Mail className="w-4 h-4 hidden sm:block" />Campaigns</TabsTrigger>
          <TabsTrigger value="abandoned" className="gap-2"><ShoppingCart className="w-4 h-4 hidden sm:block" />Abandoned</TabsTrigger>
          <TabsTrigger value="push" className="gap-2"><Bell className="w-4 h-4 hidden sm:block" />Push</TabsTrigger>
        </TabsList>

        {/* Email Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Email Campaigns</h2>
            <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Campaign</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Email Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Campaign name" value={newCampaign.name} onChange={e => setNewCampaign(p => ({...p, name: e.target.value}))} />
                  <Input placeholder="Email subject" value={newCampaign.subject} onChange={e => setNewCampaign(p => ({...p, subject: e.target.value}))} />
                  <Select value={newCampaign.campaign_type} onValueChange={v => setNewCampaign(p => ({...p, campaign_type: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="festival">Festival Campaign</SelectItem>
                      <SelectItem value="coupon">Coupon Campaign</SelectItem>
                      <SelectItem value="product_launch">Product Launch</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newCampaign.target_audience} onValueChange={v => setNewCampaign(p => ({...p, target_audience: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="newsletter">Newsletter Subscribers</SelectItem>
                      <SelectItem value="customers">Registered Customers</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Email content..." rows={6} value={newCampaign.content} onChange={e => setNewCampaign(p => ({...p, content: e.target.value}))} />
                  <Button className="w-full" onClick={() => createCampaign.mutate()} disabled={!newCampaign.name || !newCampaign.subject || createCampaign.isPending}>
                    {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {campaignsLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : campaigns.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground"><Mail className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No campaigns yet. Create your first email campaign.</p></CardContent></Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Audience</TableHead>
                    <TableHead className="hidden md:table-cell">Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{campaignTypeLabels[c.campaign_type] || c.campaign_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[c.status] as any || 'secondary'} className="text-xs capitalize">{c.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell capitalize text-sm">{c.target_audience}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{c.total_sent || 0}/{c.total_recipients || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {c.status === 'draft' && (
                            <Button size="sm" variant="default" onClick={() => sendCampaign.mutate(c.id)} disabled={sendCampaign.isPending}>
                              <Send className="w-3 h-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteCampaign.mutate(c.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Abandoned Carts Tab */}
        <TabsContent value="abandoned" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Abandoned Carts</h2>
            <Button size="sm" variant="outline" onClick={() => triggerAbandonedEmails.mutate()} disabled={triggerAbandonedEmails.isPending}>
              <Mail className="w-4 h-4 mr-1" />{triggerAbandonedEmails.isPending ? 'Sending...' : 'Send Recovery Emails'}
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">How it works</p>
                  <p className="text-xs text-muted-foreground">When a logged-in user adds items to their cart and leaves without purchasing, the cart is saved. After 30 minutes, a recovery email is automatically sent with their cart items and a link to complete checkout.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {cartsLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : abandonedCarts.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground"><ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No abandoned carts at the moment.</p></CardContent></Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cart ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Email Sent</TableHead>
                    <TableHead className="hidden sm:table-cell">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abandonedCarts.map(cart => {
                    const items = (cart.cart_items as any[]) || [];
                    return (
                      <TableRow key={cart.id}>
                        <TableCell className="text-xs font-mono">{cart.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{items.length} items</Badge>
                        </TableCell>
                        <TableCell className="font-medium">₹{Number(cart.cart_total).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={cart.email_sent ? 'default' : 'outline'}>
                            {cart.email_sent ? 'Sent' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {format(new Date(cart.updated_at), 'dd MMM, HH:mm')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Push Notifications Tab */}
        <TabsContent value="push" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Push Notifications</h2>
            <Dialog open={showCreateNotification} onOpenChange={setShowCreateNotification}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Notification</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Push Notification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Notification title" value={newNotification.title} onChange={e => setNewNotification(p => ({...p, title: e.target.value}))} />
                  <Textarea placeholder="Notification body..." rows={3} value={newNotification.body} onChange={e => setNewNotification(p => ({...p, body: e.target.value}))} />
                  <Input placeholder="Link URL (optional)" value={newNotification.url} onChange={e => setNewNotification(p => ({...p, url: e.target.value}))} />
                  <Select value={newNotification.notification_type} onValueChange={v => setNewNotification(p => ({...p, notification_type: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="flash_sale">Flash Sale</SelectItem>
                      <SelectItem value="back_in_stock">Back in Stock</SelectItem>
                      <SelectItem value="price_drop">Price Drop</SelectItem>
                      <SelectItem value="new_arrival">New Arrival</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full" onClick={() => createNotification.mutate()} disabled={!newNotification.title || !newNotification.body || createNotification.isPending}>
                    {createNotification.isPending ? 'Creating...' : 'Create Notification'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Push Notification Subscribers: {subCount}</p>
                  <p className="text-xs text-muted-foreground">Users who have opted in to receive push notifications from your store.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {notificationsLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : notifications.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground"><Bell className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No push notifications created yet.</p></CardContent></Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map(n => (
                    <TableRow key={n.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{n.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{n.body}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs capitalize">{n.notification_type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={n.status === 'sent' ? 'default' : 'secondary'} className="text-xs capitalize">{n.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{n.total_sent || 0}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => deleteNotification.mutate(n.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMarketing;
