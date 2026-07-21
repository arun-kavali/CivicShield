# Organizations & multi-tenant roles

Add tenant isolation on top of the existing CivicShield AI app. Every alert, incident, connector, and activity record becomes scoped to an organization. Users belong to one org with an org-level role, plus the existing global roles stay for platform-level admin.

## Scope

In scope:
- New `organizations` table + membership.
- Extend `app_role` enum with `org_admin` and `security_officer` (keeping existing `admin`, `analyst`, `alert_source`).
- Scope `alerts`, `incidents`, `alert_incident_map`, `incident_activity`, `data_connectors` by `organization_id`.
- Invitation flow (email-based token, accept on signup/sign-in).
- Org onboarding for the first user of a new tenant.
- Update RLS, edge functions, and frontend queries to respect org boundary.
- Minimal org-admin UI (org settings + members + invitations).

Out of scope (later milestones): MITRE mapping, business impact, investigation workspace v2, migrating AI to Lovable AI Gateway (user chose to keep OpenAI direct).

## Roles model

Extend the enum, don't replace it:

```text
app_role
├── admin              (existing) platform super-admin, cross-tenant
├── org_admin          (new)      Organization Administrator
├── security_officer   (new)      Security Officer
├── analyst            (existing) Security Team Member
└── alert_source       (existing) Alert Source (ingest-only user)
```

- `admin` bypasses org scoping (future super-admin).
- `org_admin` manages their org: members, invitations, connectors.
- `security_officer` full read/write on incidents+alerts in their org, can resolve.
- `analyst` (Team Member) works incidents/alerts in their org, can't manage members.
- `alert_source` unchanged — restricted to their org's ingestion surface.

## Data model changes

New tables:

```sql
organizations (
  id uuid pk, name text, slug text unique, sector text,
  created_by uuid references auth.users, created_at, updated_at
)

organization_members (
  organization_id uuid, user_id uuid, joined_at,
  primary key (organization_id, user_id)
)  -- one org per user for v1

organization_invitations (
  id uuid pk, organization_id uuid, email citext, role app_role,
  token text unique, invited_by uuid, expires_at, accepted_at
)
```

Add `organization_id uuid` (nullable at first, backfilled, then set NOT NULL) to:
`alerts`, `incidents`, `data_connectors`, `incident_activity`.
`alert_incident_map` inherits scope via joins.

Backfill strategy: create a "Default Organization", assign all existing users to it, backfill all existing rows, then enforce NOT NULL.

Helper security-definer functions:

```sql
current_user_org_id() returns uuid   -- reads organization_members
is_org_member(_org uuid) returns boolean
has_org_role(_org uuid, _role app_role) returns boolean
```

## RLS rewrite

Every scoped table's policies become:

- SELECT: `is_org_member(organization_id) OR has_role(auth.uid(), 'admin')`
- INSERT/UPDATE/DELETE: role check AND `organization_id = current_user_org_id()`

`user_roles` stays global. `organization_members` readable by members of the same org.

Grants follow the required pattern: explicit GRANTs for `authenticated` and `service_role`, then `ENABLE RLS`, then policies.

## Edge function updates

`process-alerts`, `analyze-alert`, `generate-incident-summary`, `investigate-chat`, `health-summary`:
- Resolve the caller's org (from JWT → `organization_members`).
- For alert-source ingest, resolve org from the alert-source user's membership.
- All inserts include `organization_id`. All reads filter by it.
- Cross-tenant leakage prevented in the service-role code paths (no more unfiltered `.select('*')`).

## Frontend

- `useAuth` extended to expose `organizationId` and `orgRole`.
- New `/onboarding` route: if a signed-in user has no org membership, prompt to create org or accept a pending invitation via token.
- New `/settings/organization` page (org_admin only): edit org, list members, invite by email + role, revoke pending invites.
- Sidebar shows current org name.
- All list queries (`useAlerts`, `useIncidents`, dashboard hooks, connectors) already run through RLS — no explicit `.eq('organization_id', ...)` needed once RLS enforces it, but hooks add it defensively for indexing.
- Invitation accept page `/invite/:token`.

## Migrations plan (single migration file)

1. `CREATE TYPE`-style additions: `ALTER TYPE app_role ADD VALUE 'org_admin'; ADD VALUE 'security_officer';`
2. Create `organizations`, `organization_members`, `organization_invitations` + GRANTs.
3. Create helper functions.
4. Add nullable `organization_id` columns.
5. Insert "Default Organization", backfill all data rows and memberships.
6. Set `organization_id` NOT NULL + FKs + indexes.
7. Drop old RLS policies on affected tables, recreate org-scoped ones.
8. Update `handle_new_user` trigger to also create membership when signup metadata includes an invitation token or a new-org name.

## Rollout order

```text
1. Migration                          (DB shape + RLS)
2. Regenerate types.ts                (auto by tooling)
3. useAuth + org context              (frontend plumbing)
4. Onboarding + invite routes         (unblock new tenants)
5. Org settings page                  (member/invitation mgmt)
6. Edge function org scoping          (server-side enforcement)
7. Manual QA per role                 (admin/org_admin/officer/analyst/alert_source)
```

## Risks

- Enum values added in the same transaction can't be used until commit — split the ALTER TYPE into its own migration statement executed before dependent SQL.
- Existing users must land in the Default Org or the app becomes unusable — backfill is mandatory before enabling NOT NULL.
- RLS policy churn is the biggest regression surface. QA each page per role.

## Deliverable

After this milestone: any new signup either creates a new organization (becoming its `org_admin`) or accepts an invite into an existing one; everything they see and every AI action they trigger is scoped to that org; platform `admin` retains cross-tenant visibility.
