import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";

const DEFAULT_REFETCH = 30000;

function getDashboardPayload() {
  return api.get("/dashboard").then((response) => response?.data?.data ?? response?.data ?? {});
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      const payload = await getDashboardPayload();
      const metrics = payload.metrics ?? {};
      return {
        totalAlerts: metrics.totalAlerts ?? 0,
        totalIncidents: metrics.totalIncidents ?? 0,
        openIncidents: metrics.openIncidents ?? 0,
        resolvedIncidents: metrics.resolvedIncidents ?? metrics.resolvedToday ?? 0,
        closedIncidents: metrics.closedIncidents ?? 0,
      };
    },
    refetchInterval: DEFAULT_REFETCH,
  });
}

export function useRiskTrend(days = 14) {
  return useQuery({
    queryKey: ["risk-trend", days],
    queryFn: async () => {
      const payload = await getDashboardPayload();
      const trend = payload.alertTrend?.daily ?? [];

      return (trend as Array<{ _id?: string; count?: number }>)
        .slice(-days)
        .map((item) => ({
          date: item._id ? String(item._id) : "",
          avgRisk: item.count ? Math.max(0, Math.min(100, Math.round(item.count * 10))) : 0,
          volume: item.count ?? 0,
        }));
    },
    refetchInterval: DEFAULT_REFETCH,
  });
}

export function useAttackTrends(days = 30, topN = 5) {
  return useQuery({
    queryKey: ["attack-trends", days, topN],
    queryFn: async () => {
      const payload = await getDashboardPayload();
      const severityDistribution = payload.alertsBySeverity ?? {};
      const series = Object.keys(severityDistribution).slice(0, topN);

      return {
        series,
        data: series.length
          ? [
              {
                date: "Overview",
                ...Object.fromEntries(series.map((key) => [key, severityDistribution[key] ?? 0])),
              },
            ]
          : [],
      };
    },
    refetchInterval: DEFAULT_REFETCH,
  });
}

export function useAlertsByPeriod(period: "day" | "week" | "month" = "day", buckets = 14) {
  return useQuery({
    queryKey: ["alerts-by-period", period, buckets],
    queryFn: async () => {
      const payload = await getDashboardPayload();
      const trendKey = period === "week" ? "weekly" : period === "month" ? "monthly" : "daily";
      const trend = payload.alertTrend?.[trendKey] ?? payload.alertTrend?.daily ?? [];

      return (trend as Array<{ _id?: string; count?: number }>)
        .slice(0, buckets)
        .map((item) => ({
          label: item._id ? String(item._id) : "",
          total: item.count ?? 0,
          critical: 0,
        }));
    },
    refetchInterval: DEFAULT_REFETCH,
  });
}

export function useRecentAISummaries(limit = 6) {
  const { organization } = useAuth();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ["recent-ai-summaries", orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];

      const payload = await getDashboardPayload();
      const incidents = payload.recentIncidents ?? [];

      return (incidents as Array<any>)
        .slice(0, limit)
        .map((incident) => ({
          id: incident.id ?? incident._id,
          incident_reason: incident.incidentReason ?? incident.incident_reason ?? incident.reason ?? null,
          ai_summary: incident.aiSummary ?? incident.ai_summary ?? null,
          severity: incident.severity,
          status: incident.status,
          created_at: incident.createdAt ?? incident.created_at ?? incident.created ?? null,
        }));
    },
    enabled: !!orgId,
    refetchInterval: DEFAULT_REFETCH,
  });
}
