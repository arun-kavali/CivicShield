import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

export type Alert = Tables<"alerts"> & {
  ai_used?: boolean;
  metadata?: Record<string, unknown> | null;
};

export function useAlerts(limit?: number) {
  const { organization } = useAuth();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ["alerts", orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("alerts")
        .select("*")
        .eq("organization_id", orgId)
        .order("timestamp", { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Alert[];
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}

export function useAlertsBySeverity() {
  const { organization } = useAuth();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ["alerts-by-severity", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from("alerts")
        .select("severity")
        .eq("organization_id", orgId);

      if (error) throw error;

      const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
      data?.forEach((alert) => {
        counts[alert.severity] = (counts[alert.severity] || 0) + 1;
      });

      return Object.entries(counts).map(([severity, count]) => ({
        severity,
        count,
      }));
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}

export function useAlertsBySource() {
  const { organization } = useAuth();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ["alerts-by-source", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from("alerts")
        .select("source_system")
        .eq("organization_id", orgId);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((alert) => {
        const source = alert.source_system || "Unknown";
        counts[source] = (counts[source] || 0) + 1;
      });

      return Object.entries(counts).map(([source, count]) => ({
        source,
        count,
      }));
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}

export function useAlertsOverTime() {
  const { organization } = useAuth();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ["alerts-over-time", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("alerts")
        .select("timestamp")
        .eq("organization_id", orgId)
        .gte("timestamp", sevenDaysAgo.toISOString());
      
      if (error) throw error;

      // Group by date
      const counts: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split("T")[0];
        counts[key] = 0;
      }

      data?.forEach((alert) => {
        const date = alert.timestamp.split("T")[0];
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
