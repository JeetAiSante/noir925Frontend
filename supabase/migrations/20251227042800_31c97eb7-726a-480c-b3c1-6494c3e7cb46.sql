-- Add festival_id column to products for festival tagging
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS festival_id UUID REFERENCES public.festival_themes(id) ON DELETE SET NULL;

-- Add gender column to products for him/her categorization
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('men', 'women', 'unisex'));

-- Create site_contact table for dynamic footer content
CREATE TABLE IF NOT EXISTS public.site_contact (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT,
  email TEXT,
  address TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  whatsapp TEXT,
  gst_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_contact
ALTER TABLE public.site_contact ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site_contact
CREATE POLICY "Anyone can view site contact info" ON public.site_contact FOR SELECT USING (true);

-- Allow admins to update site_contact
CREATE POLICY "Admins can update site contact" ON public.site_contact FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Insert default contact info if not exists
INSERT INTO public.site_contact (phone, email, address, instagram_url, facebook_url, twitter_url, youtube_url, gst_number)
VALUES (
  '+91 98765 43210',
  'hello@noir925.com',
  'Mumbai, Maharashtra, India',
  'https://www.instagram.com/noir925_official',
  '',
  '',
  '',
  '27AABCN1234A1Z5'
) ON CONFLICT DO NOTHING;

-- Create tax_settings table for GST/Tax management
CREATE TABLE IF NOT EXISTS public.tax_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_name TEXT NOT NULL DEFAULT 'GST',
  tax_percent NUMERIC NOT NULL DEFAULT 0,
  is_inclusive BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view tax settings" ON public.tax_settings FOR SELECT USING (true);

-- Admin update
CREATE POLICY "Admins can manage tax settings" ON public.tax_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Insert default tax setting
INSERT INTO public.tax_settings (tax_name, tax_percent, is_inclusive, is_enabled)
VALUES ('GST', 3, false, true) ON CONFLICT DO NOTHING;

-- Add floating banner settings to festival_themes
ALTER TABLE public.festival_themes ADD COLUMN IF NOT EXISTS show_floating_banner BOOLEAN DEFAULT true;
ALTER TABLE public.festival_themes ADD COLUMN IF NOT EXISTS floating_banner_text TEXT;