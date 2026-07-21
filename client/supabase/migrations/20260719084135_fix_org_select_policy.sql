-- Allow users to view organizations they created (required for insert().select() to work during onboarding)
CREATE POLICY "Users can view organizations they created" ON public.organizations FOR SELECT USING (created_by = auth.uid());
