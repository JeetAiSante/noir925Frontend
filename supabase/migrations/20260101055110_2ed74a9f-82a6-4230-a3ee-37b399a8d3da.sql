-- Add Gift of Choice section to homepage_sections
INSERT INTO public.homepage_sections (section_key, section_name, is_visible, sort_order, settings)
VALUES (
  'gift_of_choice',
  'Gift of Choice',
  true,
  8,
  '{"title": "#GiftOfChoice", "subtitle": "Breathtaking gifts for your loved ones", "startingPrice": 10000, "buttonText": "Explore Now", "link": "/gifting"}'::jsonb
)
ON CONFLICT (section_key) DO UPDATE SET
  section_name = EXCLUDED.section_name,
  settings = EXCLUDED.settings;