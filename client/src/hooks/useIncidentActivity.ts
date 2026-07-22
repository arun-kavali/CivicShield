import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useAuth } from "./useAuth";

export interface Json {
  [key: string]: unknown;
}

export interface IncidentActivity {
  id: string;
  incident_id: string;
  user_id: string;
  action_type: string;
  action_label: string;
  is_demo: boolean;
  created_at: string;
  metadata: Json;
}

export type ActionType = "block_ip" | "disable_user" | "confirm_containment" | "start_investigation" | "resolve";

export function useIncidentActivity(incidentId: string) {
  return useQuery({
    queryKey: ["incident-activity", incidentId],
    queryFn: async () => {
      return [] as IncidentActivity[];
    },
    enabled: !!incidentId,
  });
}

export function useLogIncidentAction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      incidentId,
      actionType,
      actionLabel,
      metadata = {},
    }: {
      incidentId: string;
      actionType: ActionType;
      actionLabel: string;
      metadata?: Json;
    }) => {
      if (!user) throw new Error("User not authenticated");

      await api.post(`/investigations/generate/${incidentId}`, { actionType, actionLabel, metadata });
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incident-activity", variables.incidentId] });
    },
  });
}

export function useStartInvestigation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (incidentId: string) => {
      if (!user) throw new Error("User not authenticated");

      // Update incident status to In Progress
      await api.post(`/investigations/generate/${incidentId}`);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["active-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incidents-by-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (incidentId: string) => {
      if (!user) throw new Error("User not authenticated");

      // Update incident status to Resolved
      await api.post(`/investigations/generate/${incidentId}`);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["active-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incidents-by-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
