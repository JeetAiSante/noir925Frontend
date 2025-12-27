-- Create currency settings table
CREATE TABLE public.currency_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency_code TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  currency_name TEXT NOT NULL,
  exchange_rate DECIMAL(10, 4) NOT NULL DEFAULT 1.0,
  country_codes TEXT[] NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.currency_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Currency settings are publicly readable"
  ON public.currency_settings
  FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage currency settings"
  ON public.currency_settings
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default currencies
INSERT INTO public.currency_settings (currency_code, currency_symbol, currency_name, exchange_rate, country_codes, is_default) VALUES
('INR', '₹', 'Indian Rupee', 1.0, ARRAY['IN'], true),
('USD', '$', 'US Dollar', 0.012, ARRAY['US', 'UM'], false),
('GBP', '£', 'British Pound', 0.0095, ARRAY['GB', 'UK'], false),
('EUR', '€', 'Euro', 0.011, ARRAY['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI', 'GR'], false),
('AED', 'د.إ', 'UAE Dirham', 0.044, ARRAY['AE'], false),
('CAD', 'C$', 'Canadian Dollar', 0.016, ARRAY['CA'], false),
('AUD', 'A$', 'Australian Dollar', 0.018, ARRAY['AU'], false),
('SGD', 'S$', 'Singapore Dollar', 0.016, ARRAY['SG'], false);

-- Add trigger for updated_at
CREATE TRIGGER update_currency_settings_updated_at
  BEFORE UPDATE ON public.currency_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();