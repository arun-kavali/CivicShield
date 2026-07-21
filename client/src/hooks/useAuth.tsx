import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setAccessToken } from "@/api/client";
import { authService, ClientRole, CurrentUser, Organization } from "@/services/authService";

export type AppRole = ClientRole;
export type { Organization };

type DisplayUser = CurrentUser & { user_metadata: { display_name: string } };
interface AuthContextType {
  user: DisplayUser | null;
  session: null;
  role: AppRole | null;
  organization: Organization | null;
  orgLoading: boolean;
  refreshOrganization: () => Promise<void>;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: AppRole | null; organization?: Organization | null }>;
  signUp: (email: string, password: string, displayName?: string, _selectedRole?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const asDisplayUser = (user: CurrentUser): DisplayUser => ({ ...user, user_metadata: { display_name: user.name } });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DisplayUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadOrganization = async () => { const org = await authService.organization(); setOrganization(org); return org; };
  const hydrate = async () => {
    const refreshed = await authService.refresh();
    setAccessToken(refreshed.accessToken);
    const nextUser = asDisplayUser(refreshed.user);
    setUser(nextUser); setRole(nextUser.role); setOrganization(await loadOrganization());
  };

  useEffect(() => { hydrate().catch(() => { setAccessToken(null); setUser(null); setRole(null); setOrganization(null); }).finally(() => { setOrgLoading(false); setLoading(false); }); }, []);
  const refreshOrganization = async () => { setOrgLoading(true); try { await loadOrganization(); } finally { setOrgLoading(false); } };
  const signIn = async (email: string, password: string) => { try { const result = await authService.login({ email, password }); setAccessToken(result.accessToken); const nextUser = asDisplayUser(result.user); setUser(nextUser); setRole(nextUser.role); const org = await loadOrganization(); return { error: null, role: nextUser.role, organization: org }; } catch (error) { return { error: error instanceof Error ? error : new Error('Login failed.') }; } };
  const signUp = async (email: string, password: string, displayName?: string) => { try { const result = await authService.register({ email, password, name: displayName || email.split('@')[0], organizationName: `${displayName || email.split('@')[0]}'s Organization` }); setAccessToken(result.accessToken); const nextUser = asDisplayUser(result.user); setUser(nextUser); setRole(nextUser.role); setOrganization(result.organization); return { error: null }; } catch (error) { return { error: error instanceof Error ? error : new Error('Registration failed.') }; } };
  const signOut = async () => { try { await authService.logout(); } finally { setAccessToken(null); setUser(null); setRole(null); setOrganization(null); } };
  return <AuthContext.Provider value={{ user, session: null, role, organization, orgLoading, refreshOrganization, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within an AuthProvider'); return context; }