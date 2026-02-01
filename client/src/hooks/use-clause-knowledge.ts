import { useQuery, useMutation } from "@tanstack/react-query";
import type { ClauseKnowledge, InsertClauseKnowledge } from "@shared/schema";

// ============================================================================
// CUSTOM HOOKS FOR CLAUSE KNOWLEDGE
// ============================================================================

/**
 * Get or create clause explanation
 */
export function useClauseExplanation() {
  return useMutation({
    mutationFn: async (clause: InsertClauseKnowledge) => {
      const response = await fetch("/api/clauses/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clause),
      });

      if (!response.ok) {
        throw new Error("Failed to process clause");
      }

      return response.json() as Promise<{ clause: ClauseKnowledge; cached: boolean }>;
    },
  });
}

/**
 * Get top clauses (most frequently seen)
 */
export function useTopClauses(limit = 20) {
  return useQuery<ClauseKnowledge[]>({
    queryKey: ["top-clauses", limit],
    queryFn: async () => {
      const response = await fetch(`/api/clauses/top?limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch top clauses");
      }
      return response.json();
    },
  });
}
