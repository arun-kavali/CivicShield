
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'org_admin', 'alert_source');
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE public.organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sector text,
  slug text UNIQUE,
  security_score integer DEFAULT 100,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'analyst',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organization_members (
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'analyst',
  joined_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (organization_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organization_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'analyst',
  token text DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz DEFAULT now() + interval '7 days',
  created_at timestamptz DEFAULT now() NOT NULL,
  accepted_at timestamptz,
  UNIQUE (organization_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_invitations TO authenticated;
GRANT ALL ON public.organization_invitations TO service_role;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.data_connectors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'inactive',
  config jsonb DEFAULT '{}'::jsonb,
  last_sync timestamptz,
  records_imported integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_connectors TO authenticated;
GRANT ALL ON public.data_connectors TO service_role;
ALTER TABLE public.data_connectors ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  description text,
  severity text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  source_system text NOT NULL,
  timestamp timestamptz NOT NULL,
  raw_log jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  risk_score integer,
  ai_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_org_timestamp ON public.alerts(organization_id, timestamp);

CREATE TABLE public.incidents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  severity text NOT NULL,
  status text NOT NULL DEFAULT 'Open',
  ai_summary text,
  ai_confidence integer,
  ai_recommended_actions text[],
  incident_reason text,
  auto_created boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_org_created_at ON public.incidents(organization_id, created_at);
CREATE UNIQUE INDEX unique_open_incident_title ON public.incidents (organization_id, title) WHERE status IN ('Open', 'In Progress');

CREATE TABLE public.alert_incident_map (
  alert_id uuid REFERENCES public.alerts(id) ON DELETE CASCADE,
  incident_id uuid REFERENCES public.incidents(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (alert_id, incident_id)
);
GRANT SELECT, INSERT, DELETE ON public.alert_incident_map TO authenticated;
GRANT ALL ON public.alert_incident_map TO service_role;
ALTER TABLE public.alert_incident_map ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.incident_activity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id uuid REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);
GRANT SELECT, INSERT ON public.incident_activity TO authenticated;
GRANT ALL ON public.incident_activity TO service_role;
ALTER TABLE public.incident_activity ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = org_id AND user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their organizations" ON public.organizations FOR SELECT USING (public.is_org_member(id));
CREATE POLICY "Users can view organizations they created" ON public.organizations FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can create organizations" ON public.organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Org Admins can update their organizations" ON public.organizations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = id AND user_id = auth.uid() AND role IN ('org_admin', 'admin'))
);

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view profiles in their org" ON public.profiles FOR SELECT USING (public.is_org_member(organization_id));

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view members of their organizations" ON public.organization_members FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Users can insert themselves as org members" ON public.organization_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view org invitations" ON public.organization_invitations FOR SELECT USING (public.is_org_member(organization_id));

CREATE POLICY "Users can view org connectors" ON public.data_connectors FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Org Admins can manage org connectors" ON public.data_connectors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = data_connectors.organization_id AND user_id = auth.uid() AND role IN ('org_admin', 'admin'))
);

CREATE POLICY "Users can view org alerts" ON public.alerts FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Users can insert org alerts" ON public.alerts FOR INSERT WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "Users can update org alerts" ON public.alerts FOR UPDATE USING (public.is_org_member(organization_id));

CREATE POLICY "Users can view org incidents" ON public.incidents FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Users can insert org incidents" ON public.incidents FOR INSERT WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "Users can update org incidents" ON public.incidents FOR UPDATE USING (public.is_org_member(organization_id));

CREATE POLICY "Users can view org map" ON public.alert_incident_map FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.alerts WHERE id = alert_id AND public.is_org_member(organization_id))
);
CREATE POLICY "Users can view org activity" ON public.incident_activity FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.incidents WHERE id = incident_id AND public.is_org_member(organization_id))
);
CREATE POLICY "Users can insert incident activity" ON public.incident_activity FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.incidents WHERE id = incident_id AND public.is_org_member(organization_id))
);

CREATE POLICY "Users can view org audit logs" ON public.audit_logs FOR SELECT USING (public.is_org_member(organization_id));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_orgs_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_connectors_updated_at BEFORE UPDATE ON public.data_connectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_org_id uuid;
  assigned_role public.app_role;
  safe_display_name text;
BEGIN
  safe_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'User');
  BEGIN
    assigned_role := (NEW.raw_user_meta_data->>'role')::public.app_role;
  EXCEPTION WHEN OTHERS THEN
    assigned_role := 'analyst'::public.app_role;
  END;
  IF assigned_role IS NULL THEN assigned_role := 'analyst'::public.app_role; END IF;

  INSERT INTO public.organizations (name, sector, created_by)
  VALUES (safe_display_name || '''s Organization', 'Private', NEW.id)
  RETURNING id INTO new_org_id;

  INSERT INTO public.profiles (id, email, display_name, organization_id)
  VALUES (NEW.id, COALESCE(NEW.email, ''), safe_display_name, new_org_id);

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'org_admin'::public.app_role);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.auto_process_alert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  supabase_url text;
  service_key text;
BEGIN
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);
  IF supabase_url IS NULL OR service_key IS NULL THEN RETURN NEW; END IF;
  BEGIN
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/analyze-alert',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || service_key),
      body := jsonb_build_object('alert', row_to_json(NEW))
    );
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_alert_process AFTER INSERT ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.auto_process_alert();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='alerts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='incidents') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
  END IF;
END $$;
