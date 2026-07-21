-- CivicShield AI Engine — additional schema fields for AI analysis and correlation.
-- Run this once in the Supabase SQL editor of the connected project.
-- Safe to re-run: all statements are idempotent.

ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS alert_type text,
  ADD COLUMN IF NOT EXISTS source_system text,
  ADD COLUMN IF NOT EXISTS risk_score integer,
  ADD COLUMN IF NOT EXISTS confidence integer,
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb,
  ADD COLUMN IF NOT EXISTS ai_analyzed_at timestamptz;

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS risk_score integer,
  ADD COLUMN IF NOT EXISTS confidence integer,
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb,
  ADD COLUMN IF NOT EXISTS mitre_attack jsonb,
  ADD COLUMN IF NOT EXISTS iocs jsonb,
  ADD COLUMN IF NOT EXISTS containment_steps jsonb,
  ADD COLUMN IF NOT EXISTS recovery_steps jsonb,
  ADD COLUMN IF NOT EXISTS prevention_steps jsonb,
  ADD COLUMN IF NOT EXISTS business_impact text,
  ADD COLUMN IF NOT EXISTS possible_losses text,
  ADD COLUMN IF NOT EXISTS affected_systems jsonb,
  ADD COLUMN IF NOT EXISTS root_cause text,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_alerts_org_type_created
  ON public.alerts (organization_id, alert_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_org_status_created
  ON public.incidents (organization_id, status, created_at DESC);

-- Ensure the alert auto-processing trigger can reach the Edge Function.
-- Configure these via `ALTER DATABASE postgres SET app.settings.supabase_url = '...';`
-- and `ALTER DATABASE postgres SET app.settings.service_role_key = '...';`
-- The auto_process_alert() trigger already reads them via current_setting(...).
