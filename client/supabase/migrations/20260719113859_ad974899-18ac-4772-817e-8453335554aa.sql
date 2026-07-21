
-- Extend alerts with AI analysis fields
ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS confidence integer,
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb,
  ADD COLUMN IF NOT EXISTS ai_analyzed_at timestamptz,
  ADD COLUMN IF NOT EXISTS raw_data jsonb;

-- Extend incidents with rich AI fields
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS risk_score integer,
  ADD COLUMN IF NOT EXISTS confidence integer,
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb,
  ADD COLUMN IF NOT EXISTS mitre_attack jsonb,
  ADD COLUMN IF NOT EXISTS iocs jsonb,
  ADD COLUMN IF NOT EXISTS containment_steps text[],
  ADD COLUMN IF NOT EXISTS recovery_steps text[],
  ADD COLUMN IF NOT EXISTS prevention_steps text[],
  ADD COLUMN IF NOT EXISTS business_impact text,
  ADD COLUMN IF NOT EXISTS possible_losses text,
  ADD COLUMN IF NOT EXISTS affected_systems text[],
  ADD COLUMN IF NOT EXISTS root_cause text,
  ADD COLUMN IF NOT EXISTS assigned_to uuid;

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  severity text,
  link text,
  read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read notifications" ON public.notifications;
CREATE POLICY "org members read notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "org members update own notifications" ON public.notifications;
CREATE POLICY "org members update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_notifications_org_created ON public.notifications(organization_id, created_at DESC);

-- Enable realtime for core tables
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.incidents REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Since DB-level app.settings.* GUCs are not available on Lovable Cloud,
-- disable the auto_process_alert trigger; the client invokes analyze-alert after insert.
DROP TRIGGER IF EXISTS trg_auto_process_alert ON public.alerts;
