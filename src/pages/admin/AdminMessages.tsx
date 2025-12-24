import { useState } from 'react';
import { 
  Search, 
  Mail,
  MailOpen,
  Trash2,
  Reply,
  Star,
  Clock,
  User
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
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  type: 'contact' | 'inquiry' | 'complaint' | 'feedback';
}

const initialMessages: Message[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    subject: 'Order Status Query',
    message: 'Hi, I placed an order 3 days ago (Order #NOIR241224-1234) and wanted to check on the delivery status. The tracking hasn\'t updated since yesterday. Please help.',
    date: '2024-12-24T10:30:00',
    isRead: false,
    isStarred: true,
    type: 'inquiry',
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    subject: 'Product Quality Feedback',
    message: 'Just received my silver ring from your Celestial collection. Absolutely love the quality and finish! The packaging was also premium. Will definitely order again.',
    date: '2024-12-23T15:45:00',
    isRead: true,
    isStarred: false,
    type: 'feedback',
  },
  {
    id: '3',
    name: 'Anita Desai',
    email: 'anita@example.com',
    subject: 'Custom Order Request',
    message: 'I\'m looking for a custom bridal set for my daughter\'s wedding. Can we discuss customization options? Budget is around 50,000-75,000 rupees.',
    date: '2024-12-22T09:15:00',
    isRead: true,
    isStarred: true,
    type: 'inquiry',
  },
];

const typeConfig = {
  contact: { label: 'Contact', color: 'bg-blue-500/10 text-blue-500' },
  inquiry: { label: 'Inquiry', color: 'bg-purple-500/10 text-purple-500' },
  complaint: { label: 'Complaint', color: 'bg-red-500/10 text-red-500' },
  feedback: { label: 'Feedback', color: 'bg-green-500/10 text-green-500' },
};

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  const markAsRead = (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, isRead: true } : msg
    ));
  };

  const toggleStar = (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    setSelectedMessage(null);
    toast({ title: "Message deleted", description: "The message has been removed" });
  };

  const sendReply = () => {
    if (!replyText.trim()) {
      toast({
        title: "Empty reply",
        description: "Please write a reply before sending",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reply sent",
      description: `Email sent to ${selectedMessage?.email}`,
    });
    setReplyText('');
    setSelectedMessage(null);
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'unread') return matchesSearch && !msg.isRead;
    if (filter === 'starred') return matchesSearch && msg.isStarred;
    return matchesSearch;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Messages</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
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
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          <Button 
            variant={filter === 'starred' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('starred')}
          >
            Starred
          </Button>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-background rounded-xl border border-border/50 overflow-hidden divide-y divide-border">
        {filteredMessages.map((message) => {
          const config = typeConfig[message.type];
          
          return (
            <div 
              key={message.id}
              className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${!message.isRead && 'bg-primary/5'}`}
              onClick={() => openMessage(message)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.isRead ? 'bg-muted' : 'bg-primary/10'
                  }`}>
                    {message.isRead ? (
                      <MailOpen className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Mail className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${!message.isRead && 'text-foreground'}`}>
                          {message.name}
                        </span>
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>
                      <p className={`text-sm ${!message.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                        {message.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleStar(message.id); }}
                        className={message.isStarred ? 'text-yellow-500' : ''}
                      >
                        <Star className={`w-4 h-4 ${message.isStarred && 'fill-current'}`} />
                      </button>
                      <span className="text-xs hidden sm:inline">
                        {new Date(message.date).toLocaleDateString()}
                      </span>
                    </div>
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
              {selectedMessage?.subject}
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
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {new Date(selectedMessage.date).toLocaleString()}
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
            <Button 
              variant="destructive" 
              onClick={() => selectedMessage && deleteMessage(selectedMessage.id)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
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