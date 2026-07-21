import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";

export interface Incident {
  id: string;
  severity: string;
  status: string;
  incident_reason?: string | null;
  auto_created?: boolean | null;
  created_at: string;
  updated_at: string;
  title?: string;
  summary?: string;
  risk_score?: number;
}

export function useIncidents(limit?: number) {
  const { organization } = useAuth();
  const orgId = organization?._id ?? organization?.id;

  return useQuery({
    queryKey: ["incidents", orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];

      const response = await api.get("/api/dashboard");
      const incidents = response?.data?.data?.recentIncidents ?? [];
      return (incidents as Incident[])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit ? limit : undefined) as Incident[];
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}

export function useActiveIncidents(limit?: number) {
  const { organization } = useAuth();
  const orgId = organization?._id ?? organization?.id;

  return useQuery({
    queryKey: ["active-incidents", orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];

      const response = await api.get("/api/dashboard");
      const incidents = response?.data?.data?.recentIncidents ?? [];
      return (incidents as Incident[])
        .filter((incident) => incident.status !== "Resolved" && incident.status !== "Closed")
        .slice(0, limit ? limit : undefined) as Incident[];
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}

export function useIncidentsByStatus() {
  const { organization } = useAuth();
  const orgId = organization?._id ?? organization?.id;

  return useQuery({
    queryKey: ["incidents-by-status", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const response = await api.get("/api/dashboard");
      const incidents = response?.data?.data?.recentIncidents ?? [];
      const counts: Record<string, number> = { Open: 0, "In Progress": 0, Resolved: 0, Closed: 0 };
      incidents.forEach((incident: Incident) => {
        counts[incident.status] = (counts[incident.status] || 0) + 1;
      });

      return Object.entries(counts).map(([status, count]) => ({ status, count }));
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}

export function useIncidentAlerts(incidentId: string) {
  return useQuery({
    queryKey: ["incident-alerts", incidentId],
    queryFn: async () => {
      const response = await api.get("/api/alerts");
      const alerts = response?.data?.data?.alerts ?? [];
      return alerts as import("./useAlerts").Alert[];
    },
    enabled: !!incidentId,
  });
}
