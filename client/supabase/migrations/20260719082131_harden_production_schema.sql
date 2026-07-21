-- 1. Add missing columns to incidents
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS incident_reason text;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS auto_created boolean DEFAULT false;

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_org_timestamp ON public.alerts(organization_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_org_created_at ON public.incidents(organization_id, created_at);
