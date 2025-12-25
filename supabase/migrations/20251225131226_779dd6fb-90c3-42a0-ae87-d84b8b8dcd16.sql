-- Create table for coupons/promotional sales
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_order_value NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  applicable_products JSONB DEFAULT '[]',
  applicable_categories JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage coupons" 
ON public.coupons 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active coupons" 
ON public.coupons 
FOR SELECT 
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample coupons
INSERT INTO public.coupons (name, code, description, discount_type, discount_value, min_order_value, start_date, end_date, is_active)
VALUES 
  ('Monsoon Sale', 'MONSOON50', 'Get 50% off on all products', 'percentage', 50, 2999, '2024-07-01', '2024-08-31', true),
  ('Festive Season', 'FESTIVE30', 'Festival special 30% discount', 'percentage', 30, 1999, '2024-10-01', '2024-11-30', true),
  ('New Customer', 'NEW500', 'Welcome discount for new customers', 'fixed', 500, 1999, '2024-01-01', '2024-12-31', true),
  ('Christmas Special', 'XMAS25', 'Christmas special 25% off', 'percentage', 25, 999, '2024-12-20', '2024-12-26', true);