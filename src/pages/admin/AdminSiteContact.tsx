import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, Phone, Mail, MapPin, Globe, Instagram, Facebook, Twitter, Youtube, FileImage, PenTool } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminSecurityWrapper from '@/components/admin/AdminSecurityWrapper';
import ImageUpload from '@/components/admin/ImageUpload';

interface SiteContact {
  id: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  gst_number: string | null;
  company_name: string | null;
  company_logo: string | null;
  company_signature: string | null;
  invoice_prefix: string | null;
}

const AdminSiteContact = () => {
  const queryClient = useQueryClient();

  const { data: contactInfo, isLoading } = useQuery({
    queryKey: ['site-contact-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_contact')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as SiteContact | null;
    },
  });

  const [formData, setFormData] = useState<Partial<SiteContact>>({});

  useEffect(() => {
    if (contactInfo) {
      setFormData(contactInfo);
    }
  }, [contactInfo]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SiteContact>) => {
      if (contactInfo?.id) {
        const { error } = await supabase
          .from('site_contact')
          .update(data)
          .eq('id', contactInfo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_contact')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-contact-admin'] });
      queryClient.invalidateQueries({ queryKey: ['site-contact'] });
      toast.success('Contact information updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  const handleChange = (field: keyof SiteContact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value || null }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminSecurityWrapper>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminSecurityWrapper>
    );
  }

  const currentData = { ...contactInfo, ...formData };

  return (
    <AdminSecurityWrapper>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl mb-2">Site Contact</h1>
            <p className="text-muted-foreground">Manage contact information displayed across the website</p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Company Branding */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-primary" />
                Company Branding
              </CardTitle>
              <CardDescription>Logo and signature for invoices and emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={currentData.company_name || ''}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="NOIR925"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Invoice Prefix</Label>
                  <Input
                    value={currentData.invoice_prefix || ''}
                    onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                    placeholder="INV-"
                  />
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input
                    value={currentData.gst_number || ''}
                    onChange={(e) => handleChange('gst_number', e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    Company Logo
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Used in invoices, emails, and receipts. Recommended: PNG with transparent background.
                  </p>
                  <ImageUpload
                    bucket="banner-images"
                    value={currentData.company_logo || ''}
                    onChange={(url) => handleChange('company_logo', url as string)}
                    aspectRatio="video"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <PenTool className="w-4 h-4" />
                    Company Signature
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Digital signature for invoices. Recommended: PNG with transparent background.
                  </p>
                  <ImageUpload
                    bucket="banner-images"
                    value={currentData.company_signature || ''}
                    onChange={(url) => handleChange('company_signature', url as string)}
                    aspectRatio="video"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Contact Details
              </CardTitle>
              <CardDescription>Primary contact information for customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </Label>
                <Input
                  value={currentData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </Label>
                <Input
                  type="email"
                  value={currentData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="support@noir925.com"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> WhatsApp Number
                </Label>
                <Input
                  value={currentData.whatsapp || ''}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Address
                </Label>
                <Textarea
                  value={currentData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Full business address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Social Media Links
              </CardTitle>
              <CardDescription>Social media profiles for footer and sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> Instagram URL
                </Label>
                <Input
                  value={currentData.instagram_url || ''}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/noir925"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" /> Facebook URL
                </Label>
                <Input
                  value={currentData.facebook_url || ''}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  placeholder="https://facebook.com/noir925"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" /> Twitter/X URL
                </Label>
                <Input
                  value={currentData.twitter_url || ''}
                  onChange={(e) => handleChange('twitter_url', e.target.value)}
                  placeholder="https://twitter.com/noir925"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Youtube className="w-4 h-4" /> YouTube URL
                </Label>
                <Input
                  value={currentData.youtube_url || ''}
                  onChange={(e) => handleChange('youtube_url', e.target.value)}
                  placeholder="https://youtube.com/@noir925"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Where this information appears:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Footer</strong> - Contact details and social media icons</li>
              <li>• <strong>Contact Page</strong> - Full contact information</li>
              <li>• <strong>Help Center</strong> - Support contact details</li>
              <li>• <strong>Order Emails</strong> - Company logo and signature</li>
              <li>• <strong>Invoice</strong> - Logo, signature, GST number and address</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminSiteContact;