import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
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

      const response = await api.get("/api/dashboard");
      const metrics = response?.data?.data?.metrics ?? {};

      return {
        totalAlerts: metrics.totalAlerts ?? 0,
        criticalAlerts: metrics.criticalAlerts ?? 0,
        openIncidents: metrics.openIncidents ?? 0,
        resolvedToday: metrics.resolvedToday ?? metrics.resolvedIncidents ?? 0,
      };
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}
