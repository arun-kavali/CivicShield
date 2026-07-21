-- =========================================================
-- MASTER SCHEMA MIGRATION FOR CIVICSHIELD AI
-- =========================================================
-- This script creates the entire production database schema
-- including multi-tenant RLS, relationships, and triggers.

-- 1. ENUMS & EXTENSIONS
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'org_admin', 'alert_source');
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE TENANCY TABLES
CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    sector text,
    security_score integer DEFAULT 100,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    display_name text,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'analyst',
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

CREATE TABLE public.organization_members (
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'analyst',
    joined_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE public.organization_invitations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    email text NOT NULL,
    role app_role NOT NULL DEFAULT 'analyst',
    token text DEFAULT encode(gen_random_bytes(32), 'hex'),
    invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at timestamptz DEFAULT now() + interval '7 days',
    created_at timestamptz DEFAULT now() NOT NULL,
    accepted_at timestamptz,
    UNIQUE (organization_id, email)
);

-- 3. PLATFORM ENTITIES
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

CREATE TABLE public.alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    severity text NOT NULL,
    status text NOT NULL DEFAULT 'new',
    source text NOT NULL,
    timestamp timestamptz NOT NULL,
    raw_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.incidents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    severity text NOT NULL,
    status text NOT NULL DEFAULT 'open',
    ai_summary text,
    ai_confidence integer,
    ai_recommended_actions text[],
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.alert_incident_map (
    alert_id uuid REFERENCES public.alerts(id) ON DELETE CASCADE,
    incident_id uuid REFERENCES public.incidents(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (alert_id, incident_id)
);

CREATE TABLE public.incident_activity (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id uuid REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

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

-- 4. ROW LEVEL SECURITY (MULTI-TENANCY)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_incident_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id AND user_id = auth.uid()
    )
$$;

-- RLS Policies
-- Organizations
CREATE POLICY "Users can view their organizations" ON public.organizations FOR SELECT USING (public.is_org_member(id));
CREATE POLICY "Org Admins can update their organizations" ON public.organizations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = id AND user_id = auth.uid() AND role IN ('org_admin', 'admin')
    )
);

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view profiles in their org" ON public.profiles FOR SELECT USING (public.is_org_member(organization_id));

-- Members & Roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view members of their organizations" ON public.organization_members FOR SELECT USING (public.is_org_member(organization_id));

-- Data Connectors
CREATE POLICY "Users can view org connectors" ON public.data_connectors FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Org Admins can manage org connectors" ON public.data_connectors FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = data_connectors.organization_id AND user_id = auth.uid() AND role IN ('org_admin', 'admin')
    )
);

-- Alerts & Incidents
CREATE POLICY "Users can view org alerts" ON public.alerts FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Users can insert org alerts" ON public.alerts FOR INSERT WITH CHECK (public.is_org_member(organization_id));

CREATE POLICY "Users can view org incidents" ON public.incidents FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Users can update org incidents" ON public.incidents FOR UPDATE USING (public.is_org_member(organization_id));
CREATE POLICY "Users can insert org incidents" ON public.incidents FOR INSERT WITH CHECK (public.is_org_member(organization_id));

-- Map & Activity
CREATE POLICY "Users can view org map" ON public.alert_incident_map FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.alerts WHERE id = alert_id AND public.is_org_member(organization_id))
);
CREATE POLICY "Users can view org activity" ON public.incident_activity FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.incidents WHERE id = incident_id AND public.is_org_member(organization_id))
);

-- Audit Logs
CREATE POLICY "Users can view org audit logs" ON public.audit_logs FOR SELECT USING (public.is_org_member(organization_id));

-- 5. TRIGGERS

-- Trigger: Auto-create profile, organization, and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_org_id uuid;
  assigned_role public.app_role;
  safe_display_name text;
BEGIN
  -- 1. Determine safe display name
  safe_display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'display_name',
    split_part(NEW.email, '@', 1),
    'User'
  );

  -- 2. Determine role from metadata (from frontend sign up)
  BEGIN
    assigned_role := (NEW.raw_user_meta_data->>'role')::public.app_role;
  EXCEPTION WHEN OTHERS THEN
    assigned_role := 'analyst'::public.app_role;
  END;

  IF assigned_role IS NULL THEN
    assigned_role := 'analyst'::public.app_role;
  END IF;

  -- 3. Create the profile record first (org_id is null for now)
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    safe_display_name
  );

  -- 4. Create an organization for the user
  INSERT INTO public.organizations (name, sector)
  VALUES (
    safe_display_name || '''s Organization',
    'Private'
  )
  RETURNING id INTO new_org_id;

  -- 5. Update profile with new organization_id
  UPDATE public.profiles
  SET organization_id = new_org_id
  WHERE id = NEW.id;

  -- 6. Add user as admin to their new organization
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'org_admin'::public.app_role);

  -- 7. Add user platform role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but still return NEW so auth.users record isn't aborted
  RAISE WARNING 'handle_new_user trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Process New Alerts (using env vars)
CREATE OR REPLACE FUNCTION public.auto_process_alert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  supabase_url text;
  service_key text;
BEGIN
  -- We strictly use environment variables configured in Supabase Vault / Settings
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);
  
  -- Prevent failure if variables aren't set
  IF supabase_url IS NULL OR service_key IS NULL THEN
      RETURN NEW;
  END IF;

  BEGIN
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/analyze-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object('alert', row_to_json(NEW))
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_alert_process AFTER INSERT ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.auto_process_alert();

-- 6. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('reports', 'reports', false),
  ('attachments', 'attachments', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage
CREATE POLICY "Users can view their org reports" ON storage.objects FOR SELECT USING (bucket_id = 'reports');
CREATE POLICY "Users can upload org reports" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Users can view attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Users can upload attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
