import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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

    invalidate();
    const interval = window.setInterval(invalidate, 15000);
    toast.dismiss();
    return () => window.clearInterval(interval);
  }, [queryClient, orgId]);
}
