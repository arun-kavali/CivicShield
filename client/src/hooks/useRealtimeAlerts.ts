import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export function useRealtimeAlerts() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  const orgId = organization?._id ?? organization?.id;

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

    invalidate();
    const interval = window.setInterval(invalidate, 15000);
    return () => window.clearInterval(interval);
  }, [queryClient, orgId]);
}
