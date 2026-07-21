-- Add a unique constraint to prevent duplicate open incidents for the same organization and title.
-- This prevents race conditions when analyze-alert webhook creates incidents under high concurrency.
CREATE UNIQUE INDEX unique_open_incident_title ON public.incidents (organization_id, title) WHERE status IN ('Open', 'In Progress');
