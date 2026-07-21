-- Add metadata column to public.alerts to store AI analysis and other structured data
ALTER TABLE public.alerts ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
