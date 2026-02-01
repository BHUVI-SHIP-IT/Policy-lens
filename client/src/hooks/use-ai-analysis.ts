/**
 * React hooks for AI-powered policy analysis
 */

import { useMutation } from "@tanstack/react-query";

/**
 * Analysis request payload
 */
export interface AIAnalysisRequest {
  policyText: string;
  policyType?: "Health" | "Life" | "Auto" | "Home" | "Travel";
  specificQuestion?: string;
}

/**
 * Structured AI analysis response
 */
export interface AIAnalysisResult {
  summary: string;
  riskLevel: "Low" | "Medium" | "High";
  riskJustification: string;
  keyExclusions: string[];
  hiddenClauses: string[];
  claimRequirements: string[];
  waitingPeriods?: {
    condition: string;
    duration: string;
  }[];
  conditions?: {
    clause: string;
    plainLanguage: string;
    impact: string;
  }[];
}

/**
 * Chat question response
 */
export interface AIChatResponse {
  answer: string;
  relevantClauses: string[];
  confidence: "High" | "Medium" | "Low";
  disclaimer?: string;
}

/**
 * Hook to analyze policy with AI
 * Example usage:
 * ```tsx
 * const { mutate: analyze, isPending } = useAIAnalysis();
 * analyze({ policyText: "..." }, {
 *   onSuccess: (result) => console.log(result.summary)
 * });
 * ```
 */
export function useAIAnalysis() {
  return useMutation({
    mutationFn: async (request: AIAnalysisRequest): Promise<AIAnalysisResult> => {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "AI analysis failed");
      }

      return response.json();
    },
  });
}

/**
 * Hook to ask questions about a policy
 * Example usage:
 * ```tsx
 * const { mutate: ask, isPending } = useAIChatQuestion();
 * ask({ 
 *   policyText: "...",
 *   question: "Is dengue covered?"
 * }, {
 *   onSuccess: (response) => console.log(response.answer)
 * });
 * ```
 */
export function useAIChatQuestion() {
  return useMutation({
    mutationFn: async (params: {
      policyText: string;
      question: string;
    }): Promise<AIChatResponse> => {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get answer");
      }

      return response.json();
    },
  });
}
