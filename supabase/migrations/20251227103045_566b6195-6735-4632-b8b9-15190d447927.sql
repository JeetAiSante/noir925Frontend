-- Add popup feature toggles if they don't exist
INSERT INTO public.feature_toggles (feature_key, feature_name, description, is_enabled)
VALUES 
  ('location_popup', 'Location Popup', 'Show location detection popup for first-time visitors', true),
  ('discount_popup', 'Discount Popup', 'Show discount subscription popup after scrolling', true),
  ('spin_wheel_popup', 'Spin Wheel Popup', 'Show spin wheel game popup for logged-in users', true),
  ('newsletter_popup', 'Newsletter Popup', 'Show newsletter subscription popup', true),
  ('exit_intent_popup', 'Exit Intent Popup', 'Show popup when user is about to leave', false)
ON CONFLICT (feature_key) DO NOTHING;

-- Insert default site contact if not exists
INSERT INTO public.site_contact (phone, email, address, instagram_url, facebook_url, gst_number)
SELECT '+91 9876543210', 'support@noir925.com', 'Mumbai, Maharashtra, India', 'https://instagram.com/noir925', 'https://facebook.com/noir925', '27AADCN0000A1ZV'
WHERE NOT EXISTS (SELECT 1 FROM public.site_contact LIMIT 1);

-- Add default homepage sections if not exist
INSERT INTO public.homepage_sections (section_key, section_name, is_visible, sort_order)
VALUES 
  ('video_hero', 'Hero Section', true, 1),
  ('countdown_banner', 'Countdown Banner', true, 2),
  ('festival_banner', 'Festival Banner', true, 3),
  ('trust_strip', 'Trust Strip', true, 4),
  ('categories_carousel', 'Categories Carousel', true, 5),
  ('bestsellers', 'Bestsellers Grid', true, 6),
  ('gender_shop', 'Shop by Gender', true, 7),
  ('wedding_collection', 'Wedding Collection', true, 8),
  ('parallax_banner', 'Parallax Banner', true, 9),
  ('new_arrivals', 'New Arrivals', true, 10),
  ('trending_slider', 'Trending Slider', true, 11),
  ('editorial_section', 'Editorial Section', true, 12),
  ('video_showcase', 'Video Showcase', true, 13),
  ('featured_categories', 'Featured Categories', true, 14),
  ('brand_story', 'Brand Story', true, 15),
  ('collections_story', 'Collections Story', true, 16),
  ('shop_by_occasion', 'Shop by Occasion', true, 17),
  ('silver_care', 'Silver Care', true, 18),
  ('brand_partners', 'Brand Partners', true, 19),
  ('reviews', 'Reviews Section', true, 20),
  ('instagram_feed', 'Instagram Feed', true, 21),
  ('newsletter', 'Newsletter Section', true, 22),
  ('recently_viewed', 'Recently Viewed', true, 23),
  ('final_cta', 'Final CTA', true, 24)
ON CONFLICT (section_key) DO NOTHING;