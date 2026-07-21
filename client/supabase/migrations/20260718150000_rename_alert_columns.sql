-- Rename columns in public.alerts to match the architectural specification

ALTER TABLE public.alerts 
  RENAME COLUMN title TO alert_type;

ALTER TABLE public.alerts 
  RENAME COLUMN source TO source_system;

ALTER TABLE public.alerts 
  RENAME COLUMN raw_data TO raw_log;
