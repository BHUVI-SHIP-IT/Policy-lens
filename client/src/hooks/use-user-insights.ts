import { useMutation } from "@tanstack/react-query";
import type { InsertUserInsight } from "@shared/schema";

// ============================================================================
// CUSTOM HOOKS FOR USER INSIGHTS
// ============================================================================

/**
 * Submit anonymized question insight
 */
export function useSubmitInsight() {
  return useMutation({
    mutationFn: async (insight: InsertUserInsight) => {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(insight),
      });

      if (!response.ok) {
        throw new Error("Failed to submit insight");
      }

      return response.json();
    },
  });
}

/**
 * Normalize a question to remove PII before submitting
 */
export function normalizeQuestion(question: string): string {
  // Remove specific disease names
  question = question.replace(/\b(diabetes|dengue|cancer|covid|malaria|typhoid|heart attack|stroke)\b/gi, "<condition>");
  
  // Remove specific amounts
  question = question.replace(/\b\d+\s*(rupees|rs|inr|dollars|usd|lakhs?|crores?)\b/gi, "<amount>");
  
  // Remove names (basic pattern)
  question = question.replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, "<name>");
  
  // Remove policy numbers
  question = question.replace(/\b(policy|pol|claim)\s*#?\s*\d+\b/gi, "<policy_id>");
  
  // Remove dates
  question = question.replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, "<date>");
  
  // Remove ages
  question = question.replace(/\b(\d+)\s*(years?|yrs?|months?)\s*(old|age)\b/gi, "<age>");
  
  return question.trim();
}

/**
 * Detect if user seems confused (question marks, negative sentiment)
 */
export function detectConfusion(question: string): boolean {
  const confusionIndicators = [
    /\?\?+/, // Multiple question marks
    /\bconfus(ed|ing)\b/i,
    /\bdon't understand\b/i,
    /\bwhat does.*mean\b/i,
    /\bwhy (is|does|would|can't)\b/i,
    /\bhow come\b/i,
    /\bdoesn't make sense\b/i,
  ];

  return confusionIndicators.some((pattern) => pattern.test(question));
}

/**
 * Categorize question type
 */
export function categorizeQuestion(question: string): InsertUserInsight["category"] {
  const lowerQuestion = question.toLowerCase();

  if (
    lowerQuestion.includes("cover") ||
    lowerQuestion.includes("included") ||
    lowerQuestion.includes("eligible")
  ) {
    return "Coverage";
  }

  if (
    lowerQuestion.includes("exclud") ||
    lowerQuestion.includes("not cover") ||
    lowerQuestion.includes("denied")
  ) {
    return "Exclusion";
  }

  if (
    lowerQuestion.includes("claim") ||
    lowerQuestion.includes("reimburse") ||
    lowerQuestion.includes("settle")
  ) {
    return "Claim";
  }

  if (
    lowerQuestion.includes("when") ||
    lowerQuestion.includes("how long") ||
    lowerQuestion.includes("wait") ||
    lowerQuestion.includes("period")
  ) {
    return "Timing";
  }

  if (
    lowerQuestion.includes("document") ||
    lowerQuestion.includes("proof") ||
    lowerQuestion.includes("evidence")
  ) {
    return "Documentation";
  }

  return "Other";
}
