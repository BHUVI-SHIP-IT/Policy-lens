import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AnalysisSession } from "@shared/schema";
import { useAuth } from "./use-auth";

// ============================================================================
// SESSION MANAGEMENT HOOKS
// ============================================================================

/**
 * Generate a unique session token
 */
function generateSessionToken(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create analysis session
 */
export function useAnalysisSession() {
  const { user } = useAuth();
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [sessionToken] = useState(() => {
    // Check localStorage for existing token
    const stored = localStorage.getItem("policyLensSessionToken");
    if (stored) return stored;
    
    // Generate new token
    const newToken = generateSessionToken();
    localStorage.setItem("policyLensSessionToken", newToken);
    return newToken;
  });

  const createOrGetSession = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: token }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSession(data);
    },
  });

  const updateActivity = useMutation({
    mutationFn: async ({
      policiesAnalyzed,
      questionsAsked,
    }: {
      policiesAnalyzed: number;
      questionsAsked: number;
    }) => {
      if (!session) return;

      const response = await fetch(`/api/session/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policiesAnalyzed, questionsAsked }),
      });

      if (!response.ok) {
        throw new Error("Failed to update session");
      }

      return response.json();
    },
  });

  // Initialize session on mount
  useEffect(() => {
    createOrGetSession.mutate(sessionToken);
  }, [sessionToken]);

  return {
    session,
    sessionToken,
    updateActivity: (policies: number, questions: number) =>
      updateActivity.mutate({
        policiesAnalyzed: policies,
        questionsAsked: questions,
      }),
    isGuest: !user,
  };
}
