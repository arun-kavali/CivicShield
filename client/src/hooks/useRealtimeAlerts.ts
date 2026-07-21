import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Subscribe to real-time alert changes for the current user's organization.
 * Invalidates alert + dashboard + incident queries so the Security Analyst
 * dashboard reflects new alerts (and any incidents the AI pipeline creates)
 * without a page refresh.
 */
export function useRealtimeAlerts() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  const orgId = organization?.id;

  useEffect(() => {
    if (!orgId) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-by-severity"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-by-source"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-over-time"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    };

    const channel = supabase
      .channel(`alerts-realtime-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `organization_id=eq.${orgId}`,
        },
        invalidate,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          invalidate();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, orgId]);
}
