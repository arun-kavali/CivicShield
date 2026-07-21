import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { toast } from "sonner";

/**
 * Hook to subscribe to real-time incident changes.
 * Automatically invalidates relevant queries when incidents are created, updated, or deleted.
 */
export function useRealtimeIncidents() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  const orgId = organization?.id;

  useEffect(() => {
    if (!orgId) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["active-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incidents-by-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-ai-summaries"] });
    };

    const channel = supabase
      .channel(`incidents-realtime-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "incidents",
          filter: `organization_id=eq.${orgId}`,
        },
        (payload) => {
          // Invalidate all incident-related queries immediately
          invalidate();

          if (payload.eventType === 'INSERT') {
            const newIncident = payload.new as any;
            toast.error(`New Incident: ${newIncident.title || 'Unknown'}`, {
              description: `Severity: ${newIncident.severity || 'Medium'}. Action required immediately.`,
              duration: 8000,
            });
          }
        }
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
