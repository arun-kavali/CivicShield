-- Trigger: Auto-create profile, organization, and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_org_id uuid;
  assigned_role public.app_role;
  safe_display_name text;
BEGIN
  safe_display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'display_name',
    split_part(NEW.email, '@', 1),
    'User'
  );

  BEGIN
    assigned_role := (NEW.raw_user_meta_data->>'role')::public.app_role;
  EXCEPTION WHEN OTHERS THEN
    assigned_role := 'analyst'::public.app_role;
  END;

  IF assigned_role IS NULL THEN
    assigned_role := 'analyst'::public.app_role;
  END IF;

  INSERT INTO public.organizations (name, sector)
  VALUES (safe_display_name || '''s Organization', 'Private')
  RETURNING id INTO new_org_id;

  INSERT INTO public.profiles (id, email, display_name, organization_id)
  VALUES (NEW.id, COALESCE(NEW.email, ''), safe_display_name, new_org_id);

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'org_admin'::public.app_role);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;
