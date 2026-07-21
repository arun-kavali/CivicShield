import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DashboardStats {
  totalAlerts: number;
  criticalAlerts: number;
  openIncidents: number;
  resolvedToday: number;
}

export function useDashboardStats() {
  const { organization } = useAuth();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ["dashboard-stats", orgId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!orgId) {
        return { totalAlerts: 0, criticalAlerts: 0, openIncidents: 0, resolvedToday: 0 };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [alertsResult, criticalResult, incidentsResult, resolvedResult] = await Promise.all([
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("severity", "Critical"),
        supabase.from("incidents").select("id", { count: "exact", head: true }).eq("organization_id", orgId).in("status", ["Open", "In Progress"]),
        // Count incidents resolved today using resolved_at timestamp
        supabase.from("incidents").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "Resolved").gte("resolved_at", today.toISOString()),
      ]);

      const firstError = [alertsResult, criticalResult, incidentsResult, resolvedResult].find((result) => result.error)?.error;
      if (firstError) throw firstError;

      return {
        totalAlerts: alertsResult.count ?? 0,
        criticalAlerts: criticalResult.count ?? 0,
        openIncidents: incidentsResult.count ?? 0,
        resolvedToday: resolvedResult.count ?? 0,
      };
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}
