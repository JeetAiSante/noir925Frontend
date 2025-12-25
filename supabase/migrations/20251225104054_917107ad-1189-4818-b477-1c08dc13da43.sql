-- Fix security issues: Add proper RLS policies for contact_messages and newsletter_subscribers

-- Remove existing policies that allow public reads
DROP POLICY IF EXISTS "Public can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can read newsletter subscribers" ON public.newsletter_subscribers;

-- Create festival_themes table for admin-controlled themes
CREATE TABLE IF NOT EXISTS public.festival_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  primary_color TEXT NOT NULL DEFAULT '#D4AF37',
  secondary_color TEXT NOT NULL DEFAULT '#1a1a1a',
  accent_color TEXT NOT NULL DEFAULT '#8B7355',
  background_color TEXT NOT NULL DEFAULT '#0a0a0a',
  banner_image TEXT,
  logo_overlay TEXT,
  special_offer TEXT,
  discount_percent INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on festival_themes
ALTER TABLE public.festival_themes ENABLE ROW LEVEL SECURITY;

-- RLS policies for festival_themes
CREATE POLICY "Public can read active themes" ON public.festival_themes
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage themes" ON public.festival_themes
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create spin_wheel_settings table
CREATE TABLE IF NOT EXISTS public.spin_wheel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  show_on_pages TEXT[] DEFAULT ARRAY['shop', 'collections'],
  spins_per_day INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on spin_wheel_settings
ALTER TABLE public.spin_wheel_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for spin_wheel_settings
CREATE POLICY "Public can read spin settings" ON public.spin_wheel_settings
FOR SELECT USING (true);

CREATE POLICY "Admins can manage spin settings" ON public.spin_wheel_settings
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create spin_wheel_prizes table
CREATE TABLE IF NOT EXISTS public.spin_wheel_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  discount_percent INTEGER,
  color TEXT NOT NULL DEFAULT '#D4AF37',
  weight INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on spin_wheel_prizes
ALTER TABLE public.spin_wheel_prizes ENABLE ROW LEVEL SECURITY;

-- RLS policies for spin_wheel_prizes
CREATE POLICY "Public can read active prizes" ON public.spin_wheel_prizes
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage prizes" ON public.spin_wheel_prizes
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Insert default spin wheel settings
INSERT INTO public.spin_wheel_settings (is_enabled, show_on_pages, spins_per_day)
VALUES (true, ARRAY['shop', 'collections'], 1)
ON CONFLICT DO NOTHING;

-- Insert default prizes
INSERT INTO public.spin_wheel_prizes (label, value, discount_percent, color, weight, sort_order) VALUES
('5% OFF', 'SPIN5', 5, '#D4AF37', 30, 1),
('10% OFF', 'SPIN10', 10, '#8B7355', 25, 2),
('15% OFF', 'SPIN15', 15, '#C0C0C0', 15, 3),
('Free Shipping', 'FREESHIP', NULL, '#FFD700', 15, 4),
('20% OFF', 'SPIN20', 20, '#B8860B', 10, 5),
('Try Again', 'TRYAGAIN', NULL, '#4a4a4a', 5, 6)
ON CONFLICT DO NOTHING;

-- Add triggers for updated_at
CREATE TRIGGER update_festival_themes_updated_at
  BEFORE UPDATE ON public.festival_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spin_wheel_settings_updated_at
  BEFORE UPDATE ON public.spin_wheel_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spin_wheel_prizes_updated_at
  BEFORE UPDATE ON public.spin_wheel_prizes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();