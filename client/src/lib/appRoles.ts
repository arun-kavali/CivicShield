export type AppRole = "organization_admin" | "security_officer" | "security_analyst";

export interface OrganizationInvitation {
  id: string;
  token: string;
  email: string;
  role: AppRole;
  created_at: string;
}

export const ORG_ROLE_LABELS: Record<AppRole, string> = {
  organization_admin: "Organization Administrator",
  security_officer: "Security Officer",
  security_analyst: "Security Analyst",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
