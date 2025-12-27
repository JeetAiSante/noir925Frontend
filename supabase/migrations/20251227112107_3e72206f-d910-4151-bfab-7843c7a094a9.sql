-- Add hover_image_index to products table for selecting which image to show on hover
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS hover_image_index integer DEFAULT 1;

-- Add company settings for invoices
ALTER TABLE public.site_contact 
ADD COLUMN IF NOT EXISTS company_name text DEFAULT 'NOIR925',
ADD COLUMN IF NOT EXISTS company_logo text,
ADD COLUMN IF NOT EXISTS company_signature text,
ADD COLUMN IF NOT EXISTS invoice_prefix text DEFAULT 'INV-';

-- Create invoice templates table
CREATE TABLE IF NOT EXISTS public.invoice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT 'NOIR925',
  company_logo text,
  company_signature text,
  invoice_prefix text DEFAULT 'INV-',
  footer_text text DEFAULT 'Thank you for shopping with NOIR925!',
  terms_text text DEFAULT 'All sales are final. Please refer to our return policy for more details.',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoice_settings
CREATE POLICY "Admins can manage invoice settings" ON public.invoice_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read invoice settings" ON public.invoice_settings
  FOR SELECT USING (true);

-- Insert default invoice settings
INSERT INTO public.invoice_settings (company_name, invoice_prefix, footer_text)
VALUES ('NOIR925', 'INV-', 'Thank you for shopping with NOIR925!')
ON CONFLICT DO NOTHING;