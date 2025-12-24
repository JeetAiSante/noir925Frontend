import { useState } from 'react';
import { 
  Search, 
  Mail,
  MailOpen,
  Trash2,
  Reply,
  Star,
  Clock,
  User,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useContactMessages, useUpdateContactMessage } from '@/hooks/useAdminData';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500/10 text-blue-500' },
  read: { label: 'Read', color: 'bg-muted text-muted-foreground' },
  replied: { label: 'Replied', color: 'bg-green-500/10 text-green-500' },
  archived: { label: 'Archived', color: 'bg-muted text-muted-foreground' },
};

const AdminMessages = () => {
  const { data: messages, isLoading } = useContactMessages();
  const updateMessage = useUpdateContactMessage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');

  const markAsRead = (id: string) => {
    updateMessage.mutate({ id, status: 'read' });
  };

  const sendReply = () => {
    if (!replyText.trim()) {
      toast.error("Please write a reply before sending");
      return;
    }

    // In a real app, you'd send the email here
    if (selectedMessage) {
      updateMessage.mutate({ id: selectedMessage.id, status: 'replied' });
    }
    
    toast.success(`Reply sent to ${selectedMessage?.email}`);
    setReplyText('');
    setSelectedMessage(null);
  };

  const openMessage = (message: any) => {
    setSelectedMessage(message);
    if (message.status === 'new') {
      markAsRead(message.id);
    }
  };

  const filteredMessages = messages?.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    if (filter === 'new') return matchesSearch && msg.status === 'new';
    if (filter === 'replied') return matchesSearch && msg.status === 'replied';
    return matchesSearch;
  }) || [];

  const newCount = messages?.filter(m => m.status === 'new').length || 0;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Messages</h1>
          <p className="text-muted-foreground">
            {newCount > 0 ? `${newCount} new messages` : 'All messages read'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'new' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('new')}
          >
            New ({newCount})
          </Button>
          <Button 
            variant={filter === 'replied' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('replied')}
          >
            Replied
          </Button>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-background rounded-xl border border-border/50 overflow-hidden divide-y divide-border">
        {filteredMessages.map((message) => {
          const config = statusConfig[message.status] || statusConfig.new;
          
          return (
            <div 
              key={message.id}
              className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${message.status === 'new' && 'bg-primary/5'}`}
              onClick={() => openMessage(message)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.status === 'new' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {message.status === 'new' ? (
                      <Mail className="w-5 h-5 text-primary" />
                    ) : message.status === 'replied' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <MailOpen className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${message.status === 'new' && 'text-foreground'}`}>
                          {message.name}
                        </span>
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>
                      <p className={`text-sm ${message.status === 'new' ? 'font-medium' : 'text-muted-foreground'}`}>
                        {message.subject || 'No subject'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {format(new Date(message.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {message.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages found</p>
          </div>
        )}
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedMessage?.subject || 'Message'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              {/* Sender Info */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedMessage.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                    {selectedMessage.phone && (
                      <p className="text-sm text-muted-foreground">{selectedMessage.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {format(new Date(selectedMessage.created_at), 'PPpp')}
                </div>
              </div>

              {/* Message Body */}
              <div className="p-4 border border-border rounded-lg">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {/* Reply Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Reply</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={sendReply} className="w-full sm:w-auto">
              <Reply className="w-4 h-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;
