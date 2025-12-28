import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  DollarSign, 
  MessageSquare, 
  FileText, 
  Bell, 
  Palette, 
  Image, 
  Timer,
  ChevronRight,
  Shield,
  Receipt,
  LayoutGrid
} from 'lucide-react';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';

const settingsLinks = [
  {
    title: 'Site Contact',
    description: 'Manage contact info, social media links, and company details',
    icon: MessageSquare,
    href: '/admin/site-contact',
  },
  {
    title: 'Currency Settings',
    description: 'Configure currencies and exchange rates',
    icon: DollarSign,
    href: '/admin/currency-settings',
  },
  {
    title: 'Page Content',
    description: 'Edit static page content and policies',
    icon: FileText,
    href: '/admin/page-content',
  },
  {
    title: 'Popup Settings',
    description: 'Manage spin wheel, discount popups, and more',
    icon: Bell,
    href: '/admin/popup-settings',
  },
  {
    title: 'Homepage Sections',
    description: 'Control homepage layout and sections',
    icon: LayoutGrid,
    href: '/admin/homepage-sections',
  },
  {
    title: 'Layout Settings',
    description: 'Product grid columns and display options',
    icon: Settings,
    href: '/admin/layout-settings',
  },
  {
    title: 'Festival Themes',
    description: 'Configure seasonal themes and banners',
    icon: Palette,
    href: '/admin/themes',
  },
  {
    title: 'Banners',
    description: 'Manage hero and promotional banners',
    icon: Image,
    href: '/admin/banners',
  },
  {
    title: 'Timers',
    description: 'Configure countdown timers and flash sales',
    icon: Timer,
    href: '/admin/timers',
  },
  {
    title: 'Trust Badges',
    description: 'Configure trust and certification badges',
    icon: Shield,
    href: '/admin/trust-badges',
  },
  {
    title: 'Tax & GST',
    description: 'Configure tax rates and GST settings',
    icon: Receipt,
    href: '/admin/tax-settings',
  },
];

const AdminSettings = () => {
  return (
    <AdminSecurityWrapper>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your website configuration</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settingsLinks.map((item) => (
            <Link key={item.href} to={item.href}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-1">{item.title}</CardTitle>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminSettings;