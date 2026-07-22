import { useState, useCallback, useEffect } from "react";
import { api } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";

interface SummaryResult {
  summary: string;
  ai_used: boolean;
  cached: boolean;
}

interface UseIncidentSummaryResult {
  summary: string | null;
  isLoading: boolean;
  isAIUsed: boolean;
  error: string | null;
  generateSummary: (incidentId: string) => Promise<void>;
  reset: () => void;
}

export function useIncidentSummary(incidentId: string | undefined, initialSummary?: string | null): UseIncidentSummaryResult {
  const [summary, setSummary] = useState<string | null>(initialSummary || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIUsed, setIsAIUsed] = useState(!initialSummary?.includes("[Rule-based analysis"));
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Reset state when incident changes
  useEffect(() => {
    setSummary(initialSummary || null);
    setIsAIUsed(!initialSummary?.includes("[Rule-based analysis"));
    setError(null);
  }, [incidentId, initialSummary]);

  const reset = useCallback(() => {
    setSummary(null);
    setIsLoading(false);
    setIsAIUsed(false);
    setError(null);
  }, []);

  const generateSummary = useCallback(async (incidentIdToGenerate: string) => {
    if (isLoading) return; // Prevent duplicate calls
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(`/investigations/generate/${incidentIdToGenerate}`);
      const result: SummaryResult = response.data.data.report;

      setSummary(result.summary);
      setIsAIUsed(result.ai_used);

      // Invalidate incidents query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate summary";
      setError(errorMessage);
      console.error("Error generating incident summary:", err);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, isLoading]);

  return {
    summary,
    isLoading,
    isAIUsed,
    error,
    generateSummary,
    reset,
  };
}
