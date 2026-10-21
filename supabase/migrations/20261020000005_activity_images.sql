-- Migration: Add image_urls column to activity_details
-- Supports storing 1 to 4 image URLs per extracted memory item

ALTER TABLE public.activity_details 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

-- Create an index for querying memories with attached photos
CREATE INDEX IF NOT EXISTS idx_activity_details_image_urls 
ON public.activity_details USING gin(image_urls);
