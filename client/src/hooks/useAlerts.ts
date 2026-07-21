import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";

export interface Alert {
  id: string;
  alert_type: string;
  source_system: string;
  severity: string;
  status: string;
  timestamp: string;
  risk_score?: number | null;
  ai_used?: boolean;
  metadata?: Record<string, unknown> | null;
  description?: string;
}

export function useAlerts(limit?: number) {
  const { organization } = useAuth();
  const orgId = organization?._id ?? organization?.id;

  return useQuery({
    queryKey: ["alerts", orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];

      const response = await api.get("/api/alerts");
      const alerts = response?.data?.data?.alerts ?? [];
      return (alerts as Alert[])
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit ? limit : undefined) as Alert[];
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}

export function useAlertsBySeverity() {
  const { organization } = useAuth();
  const orgId = organization?._id ?? organization?.id;

  return useQuery({
    queryKey: ["alerts-by-severity", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const response = await api.get("/api/alerts");
      const alerts = response?.data?.data?.alerts ?? [];
      const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
      alerts.forEach((alert: Alert) => {
        counts[alert.severity] = (counts[alert.severity] || 0) + 1;
      });

      return Object.entries(counts).map(([severity, count]) => ({ severity, count }));
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}

export function useAlertsBySource() {
  const { organization } = useAuth();
  const orgId = organization?._id ?? organization?.id;

  return useQuery({
    queryKey: ["alerts-by-source", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const response = await api.get("/api/alerts");
      const alerts = response?.data?.data?.alerts ?? [];
      const counts: Record<string, number> = {};
      alerts.forEach((alert: Alert) => {
        const source = alert.source_system || "Unknown";
        counts[source] = (counts[source] || 0) + 1;
      });

      return Object.entries(counts).map(([source, count]) => ({ source, count }));
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}

export function useAlertsOverTime() {
  const { organization } = useAuth();
  const orgId = organization?._id ?? organization?.id;

  return useQuery({
    queryKey: ["alerts-over-time", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const response = await api.get("/api/alerts");
      const alerts = response?.data?.data?.alerts ?? [];
      const counts: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split("T")[0];
        counts[key] = 0;
      }

      alerts.forEach((alert: Alert) => {
        const date = new Date(alert.timestamp).toISOString().split("T")[0];
        if (counts[date] !== undefined) {
          counts[date]++;
        }
      });

      return Object.entries(counts).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        count,
      }));
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}
