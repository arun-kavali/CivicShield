import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, Building2, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/integrations/supabase/orgTypes";
import { toast } from "sonner";

/**
 * Onboarding: shown when a signed-in user has no organization membership.
 * They can either create a new organization (becoming its org_admin) or
 * accept a pending invitation by token.
 */
export default function Onboarding() {
  const { user, refreshOrganization, signOut } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState("");
  const [inviteToken, setInviteToken] = useState(params.get("token") ?? "");
  const [busy, setBusy] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleCreateOrg = async () => {
    if (!orgName.trim()) {
      toast.error("Organization name is required");
      return;
    }
    setBusy(true);
    try {
      const slug = `${slugify(orgName)}-${Math.random().toString(36).slice(2, 6)}`;
      const { data: org, error: orgError } = await (supabase as any)
        .from("organizations")
        .insert({ name: orgName.trim(), slug, sector: sector.trim() || null, created_by: user.id })
        .select()
        .single();

      if (orgError || !org) throw orgError ?? new Error("Failed to create organization");

      const { error: memberError } = await (supabase as any)
        .from("organization_members")
        .insert({ organization_id: org.id, user_id: user.id });
      if (memberError) throw memberError;

      // Grant org_admin role to the creator.
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: user.id, role: "org_admin" as any }, { onConflict: "user_id,role" });
      if (roleError) console.warn("[onboarding] role upsert failed:", roleError.message);

      toast.success(`Organization "${org.name}" created`);
      await refreshOrganization();
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create organization");
    } finally {
      setBusy(false);
    }
  };

  const handleAcceptInvite = async () => {
    const token = inviteToken.trim();
    if (!token) {
      toast.error("Invitation token is required");
      return;
    }
    setBusy(true);
    try {
      const { data: invite, error: inviteError } = await (supabase as any)
        .from("organization_invitations")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (inviteError || !invite) throw new Error("Invitation not found or invalid");
      if (invite.accepted_at) throw new Error("This invitation has already been used");
      if (new Date(invite.expires_at).getTime() < Date.now()) throw new Error("This invitation has expired");
      if ((invite.email as string).toLowerCase() !== (user.email ?? "").toLowerCase()) {
        throw new Error(`This invitation is addressed to ${invite.email}. Sign in with that account to accept.`);
      }

      const { error: memberError } = await (supabase as any)
        .from("organization_members")
        .insert({ organization_id: invite.organization_id, user_id: user.id });
      if (memberError) throw memberError;

      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: user.id, role: invite.role }, { onConflict: "user_id,role" });
      if (roleError) console.warn("[onboarding] role upsert failed:", roleError.message);

      await (supabase as any)
        .from("organization_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      toast.success("You've joined the organization");
      await refreshOrganization();
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to accept invitation");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-semibold">CivicShield AI</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set up your workspace</CardTitle>
            <CardDescription>
              Create an organization to onboard your team, or accept an invitation to join an existing one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={inviteToken ? "invite" : "create"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">
                  <Building2 className="h-4 w-4 mr-2" /> Create organization
                </TabsTrigger>
                <TabsTrigger value="invite">
                  <Mail className="h-4 w-4 mr-2" /> Accept invite
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization name</Label>
                  <Input
                    id="org-name"
                    placeholder="e.g. City of Springfield"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={busy}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector (optional)</Label>
                  <Input
                    id="sector"
                    placeholder="Hospital, School, Municipal, NGO..."
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    disabled={busy}
                  />
                </div>
                <Button className="w-full" onClick={handleCreateOrg} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Create organization
                </Button>
                <p className="text-xs text-muted-foreground">
                  You will become the Organization Administrator with permission to invite others.
                </p>
              </TabsContent>

              <TabsContent value="invite" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Invitation token</Label>
                  <Input
                    id="token"
                    placeholder="Paste the token from your invite email"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    disabled={busy}
                  />
                </div>
                <Button className="w-full" onClick={handleAcceptInvite} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Join organization
                </Button>
                <p className="text-xs text-muted-foreground">
                  Signed in as <span className="font-medium">{user.email}</span>. The invitation must be addressed to this email.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}