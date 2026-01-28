-- Migration to seed initial data for travel_styles and traveler_types
-- This data is essential for the application's profile and plan generation features.

-- Seed data for travel_styles
INSERT INTO public.travel_styles (name, is_predefined)
VALUES
  ('Relaxation', true),
  ('Adventure', true),
  ('Cultural', true),
  ('Luxury', true),
  ('Budget', true),
  ('Foodie', true),
  ('Nature', true)
ON CONFLICT (name) DO NOTHING;

-- Seed data for traveler_types
INSERT INTO public.traveler_types (name, is_predefined)
VALUES
  ('Solo', true),
  ('Couple', true),
  ('Family', true),
  ('Group', true),
  ('Business', true)
ON CONFLICT (name) DO NOTHING;
