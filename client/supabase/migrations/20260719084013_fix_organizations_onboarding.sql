-- 1. Add missing columns to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add INSERT policies for onboarding
-- Allow any authenticated user to create an organization
CREATE POLICY "Users can create organizations" ON public.organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to insert themselves as organization members (for onboarding/invites)
CREATE POLICY "Users can insert themselves as org members" ON public.organization_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own role
CREATE POLICY "Users can insert their own roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
