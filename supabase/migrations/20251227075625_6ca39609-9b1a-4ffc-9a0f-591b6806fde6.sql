-- Create page_content table for admin-controlled content
CREATE TABLE public.page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Public read policy (everyone can view)
CREATE POLICY "Anyone can view page content"
  ON public.page_content
  FOR SELECT
  USING (is_active = true);

-- Admin write policy
CREATE POLICY "Admins can manage page content"
  ON public.page_content
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add video_url column to site_settings if needed
INSERT INTO public.site_settings (key, value, category, description)
VALUES ('homepage_video_url', '"https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-craftsman-making-jewelry-5220-large.mp4"', 'media', 'Homepage video showcase URL')
ON CONFLICT (key) DO NOTHING;

-- Insert default page content
INSERT INTO public.page_content (page_key, page_title, content, meta_title, meta_description)
VALUES 
  ('help-center', 'Help Center', '{
    "categories": [
      {
        "id": "orders",
        "title": "Orders & Delivery",
        "description": "Track orders, delivery times, shipping info",
        "icon": "Package",
        "color": "bg-blue-500/10 text-blue-600",
        "faqs": [
          {"q": "How can I track my order?", "a": "You can track your order by visiting the Track Order page and entering your order number."},
          {"q": "What are the delivery times?", "a": "Standard delivery takes 5-7 business days. Express delivery takes 2-3 business days."},
          {"q": "Do you deliver pan-India?", "a": "Yes! We deliver to all serviceable pin codes across India."}
        ]
      },
      {
        "id": "payments",
        "title": "Payments & Pricing",
        "description": "Payment methods, COD, EMI options",
        "icon": "CreditCard",
        "color": "bg-green-500/10 text-green-600",
        "faqs": [
          {"q": "What payment methods do you accept?", "a": "We accept all major credit/debit cards, UPI, net banking, and COD for orders below ₹10,000."},
          {"q": "Is Cash on Delivery available?", "a": "Yes, COD is available for orders up to ₹10,000."},
          {"q": "Do you offer EMI options?", "a": "Yes! We offer No-Cost EMI on orders above ₹3,000."}
        ]
      }
    ]
  }', 'Help Center | NOIR925', 'Get help with your NOIR925 orders, payments, shipping, and returns'),
  
  ('size-guide', 'Size Guide', '{
    "ring_sizes": [
      {"us": "4", "uk": "H", "eu": "46.8", "diameter": "14.9"},
      {"us": "5", "uk": "J", "eu": "49.3", "diameter": "15.7"},
      {"us": "6", "uk": "L", "eu": "51.9", "diameter": "16.5"},
      {"us": "7", "uk": "N", "eu": "54.4", "diameter": "17.3"},
      {"us": "8", "uk": "P", "eu": "57.0", "diameter": "18.1"}
    ],
    "bracelet_sizes": [
      {"size": "XS", "circumference": "14-15 cm", "wrist": "Very petite wrist"},
      {"size": "S", "circumference": "15-16 cm", "wrist": "Petite wrist"},
      {"size": "M", "circumference": "16-17 cm", "wrist": "Average wrist"},
      {"size": "L", "circumference": "17-18 cm", "wrist": "Larger wrist"}
    ],
    "necklace_sizes": [
      {"length": "16\"", "cm": "40 cm", "style": "Choker", "description": "Rests at the base of the neck"},
      {"length": "18\"", "cm": "45 cm", "style": "Princess", "description": "Most popular length"},
      {"length": "20\"", "cm": "50 cm", "style": "Matinee", "description": "Falls between collarbone and bust"}
    ]
  }', 'Size Guide | NOIR925', 'Find your perfect fit with our comprehensive size guide'),
  
  ('returns-policy', 'Returns & Exchanges', '{
    "sections": [
      {"title": "Return Policy", "content": "We offer a 7-day easy return policy. Items must be unused, in original packaging with all tags intact."},
      {"title": "How to Return", "content": "Go to your Account > Orders > Select the order > Click Return Item. Our team will arrange pickup within 48 hours."},
      {"title": "Refund Timeline", "content": "Refunds are processed within 5-7 business days after we receive the returned item."},
      {"title": "Exchange Policy", "content": "Exchanges for different sizes are free. Simply initiate an exchange request."}
    ]
  }', 'Returns Policy | NOIR925', 'Easy 7-day returns and free exchanges at NOIR925'),
  
  ('privacy-policy', 'Privacy Policy', '{
    "sections": [
      {"title": "Information We Collect", "content": "We collect information you provide directly, such as name, email, phone, and shipping address."},
      {"title": "How We Use Your Information", "content": "We use your information to process orders, send updates, and improve our services."},
      {"title": "Data Security", "content": "We implement industry-standard security measures to protect your personal information."},
      {"title": "Your Rights", "content": "You can request access to, correction, or deletion of your personal data at any time."}
    ]
  }', 'Privacy Policy | NOIR925', 'Your privacy is important to us. Read our privacy policy.'),
  
  ('terms-conditions', 'Terms & Conditions', '{
    "sections": [
      {"title": "Acceptance of Terms", "content": "By using our website, you agree to these terms and conditions."},
      {"title": "Products & Pricing", "content": "All products are subject to availability. Prices may change without notice."},
      {"title": "Order Acceptance", "content": "We reserve the right to refuse or cancel any order for any reason."},
      {"title": "Intellectual Property", "content": "All content on this website is owned by NOIR925 and protected by copyright laws."}
    ]
  }', 'Terms & Conditions | NOIR925', 'Terms and conditions for using NOIR925 website and services')
ON CONFLICT (page_key) DO NOTHING;