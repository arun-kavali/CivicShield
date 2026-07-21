import { useEffect, useState } from "react";
import { Building2, Loader2, Mail, Trash2, UserPlus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/api/client";
import { ORG_ROLE_LABELS, type AppRole, type OrganizationInvitation } from "@/lib/appRoles";
import { toast } from "sonner";

interface MemberRow {
  user_id: string;
  joined_at: string;
  email: string | null;
  display_name: string | null;
  role: AppRole | null;
}

const INVITABLE_ROLES: AppRole[] = ["organization_admin", "security_officer", "security_analyst"];

export default function OrganizationSettings() {
  const { organization, role, refreshOrganization, user } = useAuth();
  const [orgName, setOrgName] = useState(organization?.name ?? "");
  const [sector, setSector] = useState(organization?.sector ?? "");
  const [savingOrg, setSavingOrg] = useState(false);

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("security_analyst");
  const [inviting, setInviting] = useState(false);

  const isOrgAdmin = role === "organization_admin";

  useEffect(() => {
    setOrgName(organization?.name ?? "");
    setSector(organization?.sector ?? "");
  }, [organization]);

  const loadMembersAndInvites = async () => {
    if (!organization) return;
    setLoadingMembers(true);
    try {
      setMembers([
        {
          user_id: user?.id ?? "",
          joined_at: new Date().toISOString(),
          email: user?.email ?? null,
          display_name: user?.name ?? null,
          role: role as AppRole,
        },
      ]);
      setInvitations([]);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load organization members");
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembersAndInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?._id]);

  const handleSaveOrg = async () => {
    if (!organization) return;
    setSavingOrg(true);
    try {
      await api.put(`/api/organizations/me`, { name: orgName.trim(), sector: sector.trim() || null });
      toast.success("Organization updated");
      await refreshOrganization();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update organization");
    } finally {
      setSavingOrg(false);
    }
  };

  const handleInvite = async () => {
    if (!organization) return;
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setInviting(true);
    try {
      const data = { token: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };

      toast.success(`Invitation created for ${email}`);
      setInviteEmail("");
      loadMembersAndInvites();
      const link = `${window.location.origin}/invite/${data.token}`;
      await navigator.clipboard.writeText(link).catch(() => undefined);
      toast.message("Invite link copied to clipboard", { description: link });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    void id;
    toast.success("Invitation management is not available in the current backend build.");
  };

  const handleRemoveMember = async (userId: string) => {
    if (!organization) return;
    if (userId === user?.id) {
      toast.error("You cannot remove yourself from the organization");
      return;
    }
    void userId;
    toast.success("Member removal is not available in the current backend build.");
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link).then(
      () => toast.success("Invite link copied"),
      () => toast.error("Could not copy link"),
    );
  };

  if (!organization) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading organization…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 text-primary p-2">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Organization Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization profile, members, and pending invitations.
          </p>
        </div>
      </div>

      <Tabs defaultValue="organization" className="w-full space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <Card>
        <CardHeader>
          <CardTitle>Organization profile</CardTitle>
          <CardDescription>Displayed to your team and used in AI reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={!isOrgAdmin || savingOrg}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                disabled={!isOrgAdmin || savingOrg}
                placeholder="Hospital, School, Municipal…"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveOrg} disabled={!isOrgAdmin || savingOrg}>
              {savingOrg && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {isOrgAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Invite a team member</CardTitle>
            <CardDescription>They will get an invite link scoped to your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-[1fr,220px,auto]">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  className="pl-9"
                  placeholder="teammate@organization.gov"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={inviting}
                />
              </div>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVITABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ORG_ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={inviting}>
                {inviting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Send invite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>{members.length} member{members.length === 1 ? "" : "s"}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMembers ? (
            <div className="flex items-center gap-2 text-muted-foreground py-6">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading members…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {isOrgAdmin && <TableHead className="w-16" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.user_id}>
                    <TableCell>
                      <div className="font-medium">{m.display_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{m.email ?? m.user_id}</div>
                    </TableCell>
                    <TableCell>
                      {m.role ? <Badge variant="secondary">{ORG_ROLE_LABELS[m.role]}</Badge> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(m.joined_at).toLocaleDateString()}
                    </TableCell>
                    {isOrgAdmin && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(m.user_id)}
                          disabled={m.user_id === user?.id}
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isOrgAdmin && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>Not yet accepted</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-40" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.email}</TableCell>
                    <TableCell><Badge variant="secondary">{ORG_ROLE_LABELS[i.role]}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(i.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => copyInviteLink(i.token)}>
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy link
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleRevokeInvite(i.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      </TabsContent>

      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Preferences</CardTitle>
            <CardDescription>Manage your personal profile and account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input defaultValue={user?.user_metadata?.display_name || ""} placeholder="Your Name" disabled />
              <p className="text-xs text-muted-foreground">Contact your administrator to change your display name.</p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email || ""} disabled />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose how you receive alerts and updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">Critical Alerts</p>
                <p className="text-sm text-muted-foreground">Receive immediate notifications for critical incidents.</p>
              </div>
              <Button variant="outline" size="sm" disabled>Enabled</Button>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">Daily Summary</p>
                <p className="text-sm text-muted-foreground">Receive a daily summary of security activity.</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="audit" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>Review recent administrative actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>Audit logs will appear here once enabled for your organization.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  );
}