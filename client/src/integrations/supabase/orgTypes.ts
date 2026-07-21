// Supplemental types for the multi-tenant tables added by the
// civicshield_organizations.sql migration. Kept out of the auto-generated
// types.ts (which is regenerated from the DB and cannot be hand-edited here).

import type { Database } from "./types";

export type AppRole =
  | Database["public"]["Enums"]["app_role"]
  | "org_admin"
  | "security_officer";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  sector: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  joined_at: string;
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: AppRole;
  token: string;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export const ORG_ROLE_LABELS: Record<AppRole, string> = {
  admin: "Platform Admin",
  org_admin: "Organization Administrator",
  security_officer: "Security Officer",
  analyst: "Security Team Member",
  alert_source: "Alert Source",
};

/** Slugify a display name for use as an org slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}