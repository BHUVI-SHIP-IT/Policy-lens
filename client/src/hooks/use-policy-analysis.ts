import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PolicyAnalysis, InsertPolicyAnalysis } from "@shared/schema";

// ============================================================================
// CUSTOM HOOKS FOR POLICY ANALYSES
// ============================================================================

/**
 * Get user's policy analysis history
 */
export function usePolicyHistory(limit = 10) {
  return useQuery<PolicyAnalysis[]>({
    queryKey: ["policy-analyses", limit],
    queryFn: async () => {
      const response = await fetch(`/api/analyses?limit=${limit}`);
      if (!response.ok) {
        if (response.status === 401) {
          return []; // Not authenticated, return empty
        }
        throw new Error("Failed to fetch policy history");
      }
      return response.json();
    },
  });
}

/**
 * Get specific policy analysis
 */
export function usePolicyAnalysis(id: string | null) {
  return useQuery<PolicyAnalysis>({
    queryKey: ["policy-analysis", id],
    queryFn: async () => {
      if (!id) throw new Error("No analysis ID provided");
      
      const response = await fetch(`/api/analyses/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analysis");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Create new policy analysis
 */
export function useCreatePolicyAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analysis: Omit<InsertPolicyAnalysis, "userId">) => {
      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysis),
      });

      if (!response.ok) {
        throw new Error("Failed to create analysis");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate history to show new analysis
      queryClient.invalidateQueries({ queryKey: ["policy-analyses"] });
    },
  });
}

/**
 * Delete policy analysis
 */
export function useDeletePolicyAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/analyses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete analysis");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy-analyses"] });
    },
  });
}
