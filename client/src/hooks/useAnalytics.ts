import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DEFAULT_REFETCH = 30000;

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      const [alerts, incidentsOpen, incidentsResolved, incidentsClosed, totalIncidents] =
        await Promise.all([
          supabase.from("alerts").select("id", { count: "exact", head: true }),
          supabase.from("incidents").select("id", { count: "exact", head: true }).in("status", ["Open", "In Progress"]),
          supabase.from("incidents").select("id", { count: "exact", head: true }).eq("status", "Resolved"),
          supabase.from("incidents").select("id", { count: "exact", head: true }).eq("status", "Closed"),
          supabase.from("incidents").select("id", { count: "exact", head: true }),
        ]);
      return {
        totalAlerts: alerts.count ?? 0,
        totalIncidents: totalIncidents.count ?? 0,
        openIncidents: incidentsOpen.count ?? 0,
        resolvedIncidents: incidentsResolved.count ?? 0,
        closedIncidents: incidentsClosed.count ?? 0,
      };
    },
    refetchInterval: DEFAULT_REFETCH,
  });
}

export function useRiskTrend(days = 14) {
  return useQuery({
    queryKey: ["risk-trend", days],
    queryFn: async () => {
      const from = new Date();
      from.setDate(from.getDate() - (days - 1));
      from.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("alerts")
        .select("timestamp, risk_score, severity")
        .gte("timestamp", from.toISOString());
      if (error) throw error;

      const severityScore: Record<string, number> = { Critical: 90, High: 70, Medium: 45, Low: 20 };
      const bucket: Record<string, { total: number; count: number }> = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(from);
        d.setDate(from.getDate() + i);
        bucket[d.toISOString().split("T")[0]] = { total: 0, count: 0 };
      }
      (data ?? []).forEach((row: any) => {
        const key = String(row.timestamp).split("T")[0];
        if (!bucket[key]) return;
        const score = typeof row.risk_score === "number" ? row.risk_score : severityScore[row.severity] ?? 30;
        bucket[key].total += score;
        bucket[key].count += 1;
      });
      return Object.entries(bucket).map(([date, v]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        avgRisk: v.count ? Math.round(v.total / v.count) : 0,
        volume: v.count,
      }));
    },
    refetchInterval: DEFAULT_REFETCH,
  });
}

export function useAttackTrends(days = 30, topN = 5) {
  return useQuery({
    queryKey: ["attack-trends", days, topN],
    queryFn: async () => {
      const from = new Date();
      from.setDate(from.getDate() - (days - 1));
      from.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("alerts")
        .select("timestamp, alert_type")
        .gte("timestamp", from.toISOString());
      if (error) throw error;

      const totals: Record<string, number> = {};
      (data ?? []).forEach((r: any) => {
        const k = r.alert_type || "Unknown";
        totals[k] = (totals[k] ?? 0) + 1;
      });
      const top = Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([type]) => type);

      const byDay: Record<string, Record<string, number>> = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(from);
        d.setDate(from.getDate() + i);
        byDay[d.toISOString().split("T")[0]] = Object.fromEntries(top.map((t) => [t, 0]));
      }
      (data ?? []).forEach((r: any) => {
        const key = String(r.timestamp).split("T")[0];
        const t = r.alert_type || "Unknown";
        if (byDay[key] && top.includes(t)) byDay[key][t] += 1;
      });
      return {
        series: top,
        data: Object.entries(byDay).map(([date, counts]) => ({
          date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          ...counts,
        })),
      };
    },
    refetchInterval: DEFAULT_REFETCH,
  });
}

export function useAlertsByPeriod(period: "day" | "week" | "month" = "day", buckets = 14) {
  return useQuery({
    queryKey: ["alerts-by-period", period, buckets],
    queryFn: async () => {
      const now = new Date();
      const from = new Date(now);
      if (period === "day") from.setDate(now.getDate() - (buckets - 1));
      if (period === "week") from.setDate(now.getDate() - 7 * (buckets - 1));
      if (period === "month") from.setMonth(now.getMonth() - (buckets - 1));
      from.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("alerts")
        .select("timestamp, severity")
        .gte("timestamp", from.toISOString());
      if (error) throw error;

      const keyFor = (d: Date) => {
        if (period === "day") return d.toISOString().split("T")[0];
        if (period === "month") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        // ISO week
        const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = t.getUTCDay() || 7;
        t.setUTCDate(t.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
        const week = Math.ceil((((t.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
      };

      const bucketMap: Record<string, { total: number; critical: number }> = {};
      for (let i = 0; i < buckets; i++) {
        const d = new Date(from);
        if (period === "day") d.setDate(from.getDate() + i);
        if (period === "week") d.setDate(from.getDate() + 7 * i);
        if (period === "month") d.setMonth(from.getMonth() + i);
        bucketMap[keyFor(d)] = { total: 0, critical: 0 };
      }
      (data ?? []).forEach((r: any) => {
        const k = keyFor(new Date(r.timestamp));
        if (!bucketMap[k]) return;
        bucketMap[k].total += 1;
        if (r.severity === "Critical") bucketMap[k].critical += 1;
      });
      return Object.entries(bucketMap).map(([label, v]) => ({ label, ...v }));
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

      const { data, error } = await supabase
        .from("incidents")
        .select("id, incident_reason, ai_summary, severity, status, created_at")
        .eq("organization_id", orgId)
        .not("ai_summary", "is", null)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
    refetchInterval: DEFAULT_REFETCH,
  });
}
