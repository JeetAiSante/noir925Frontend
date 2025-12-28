-- Create table for product popup settings to show trending/hot/new/luxury products
CREATE TABLE public.product_popup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  title TEXT NOT NULL DEFAULT 'Featured Products',
  subtitle TEXT,
  theme_image TEXT,
  position TEXT NOT NULL DEFAULT 'right', -- 'right', 'center', 'bottom'
  display_duration INTEGER NOT NULL DEFAULT 10, -- seconds before auto-hide
  show_on_pages TEXT[] DEFAULT ARRAY['home', 'shop', 'collections'],
  auto_popup_delay INTEGER NOT NULL DEFAULT 5, -- seconds before showing
  max_products INTEGER NOT NULL DEFAULT 4,
  show_trending BOOLEAN NOT NULL DEFAULT true,
  show_new BOOLEAN NOT NULL DEFAULT true,
  show_bestseller BOOLEAN NOT NULL DEFAULT true,
  show_featured BOOLEAN NOT NULL DEFAULT true,
  selected_product_ids UUID[] DEFAULT '{}',
  background_color TEXT DEFAULT '#0a0a0a',
  accent_color TEXT DEFAULT '#D4AF37',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_popup_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage product popup settings"
ON public.product_popup_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read product popup settings"
ON public.product_popup_settings
FOR SELECT
USING (true);

-- Insert default settings
INSERT INTO public.product_popup_settings (
  title, 
  subtitle, 
  position,
  show_trending,
  show_new,
  show_bestseller,
  show_featured
) VALUES (
  'Trending Now',
  'Discover our most loved pieces',
  'right',
  true,
  true,
  true,
  true
);

-- Add trigger for updated_at
CREATE TRIGGER update_product_popup_settings_updated_at
BEFORE UPDATE ON public.product_popup_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add feature toggle for product popup
INSERT INTO public.feature_toggles (feature_key, feature_name, description, is_enabled)
VALUES ('product_popup', 'Product Spotlight Popup', 'Auto-show popup with trending/hot/new/luxury products', true)
ON CONFLICT (feature_key) DO NOTHING;