
-- Inventory settings table
CREATE TABLE public.inventory_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  low_stock_threshold integer NOT NULL DEFAULT 10,
  critical_stock_threshold integer NOT NULL DEFAULT 5,
  enable_low_stock_alerts boolean NOT NULL DEFAULT true,
  enable_reorder_notifications boolean NOT NULL DEFAULT true,
  reorder_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inventory settings" ON public.inventory_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read inventory settings" ON public.inventory_settings
  FOR SELECT USING (true);

-- Insert default settings
INSERT INTO public.inventory_settings (low_stock_threshold, critical_stock_threshold) VALUES (10, 5);

-- Loyalty program tables
CREATE TABLE public.loyalty_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT true,
  points_per_rupee numeric NOT NULL DEFAULT 1,
  points_value_per_rupee numeric NOT NULL DEFAULT 0.25,
  min_points_to_redeem integer NOT NULL DEFAULT 100,
  max_discount_percent integer NOT NULL DEFAULT 50,
  welcome_bonus_points integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage loyalty settings" ON public.loyalty_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read loyalty settings" ON public.loyalty_settings
  FOR SELECT USING (true);

INSERT INTO public.loyalty_settings DEFAULT VALUES;

-- User loyalty points
CREATE TABLE public.user_loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_points integer NOT NULL DEFAULT 0,
  redeemed_points integer NOT NULL DEFAULT 0,
  available_points integer GENERATED ALWAYS AS (total_points - redeemed_points) STORED,
  tier text NOT NULL DEFAULT 'bronze',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points" ON public.user_loyalty_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all points" ON public.user_loyalty_points
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own points" ON public.user_loyalty_points
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert points" ON public.user_loyalty_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Loyalty transactions
CREATE TABLE public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL,
  transaction_type text NOT NULL,
  description text,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transactions" ON public.loyalty_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions" ON public.loyalty_transactions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert transactions" ON public.loyalty_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feature toggles table
CREATE TABLE public.feature_toggles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL UNIQUE,
  feature_name text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feature toggles" ON public.feature_toggles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read feature toggles" ON public.feature_toggles
  FOR SELECT USING (true);

-- Insert default feature toggles
INSERT INTO public.feature_toggles (feature_key, feature_name, description) VALUES
  ('lucky_discount', 'Lucky Discount System', 'Enable personalized lucky discounts based on login time'),
  ('loyalty_program', 'Loyalty Program', 'Enable points earning and redemption'),
  ('gift_wrapping', 'Gift Wrapping', 'Allow customers to add gift wrapping'),
  ('spin_wheel', 'Spin Wheel', 'Enable spin wheel promotions'),
  ('low_stock_alerts', 'Low Stock Alerts', 'Show low stock warnings in admin'),
  ('email_notifications', 'Email Notifications', 'Send email notifications for various events');

-- Gift card denominations
CREATE TABLE public.gift_card_denominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL,
  bonus_amount numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gift_card_denominations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage gift card denominations" ON public.gift_card_denominations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active denominations" ON public.gift_card_denominations
  FOR SELECT USING (is_active = true);

-- Insert default gift card denominations
INSERT INTO public.gift_card_denominations (amount, bonus_amount, sort_order) VALUES
  (500, 0, 1),
  (1000, 50, 2),
  (2000, 150, 3),
  (5000, 500, 4),
  (10000, 1200, 5);

-- Triggers for updated_at
CREATE TRIGGER update_inventory_settings_updated_at BEFORE UPDATE ON public.inventory_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_settings_updated_at BEFORE UPDATE ON public.loyalty_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_loyalty_points_updated_at BEFORE UPDATE ON public.user_loyalty_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_toggles_updated_at BEFORE UPDATE ON public.feature_toggles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gift_card_denominations_updated_at BEFORE UPDATE ON public.gift_card_denominations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
