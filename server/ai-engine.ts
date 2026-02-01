/**
 * PolicyLens AI Engine
 * Core reasoning engine for insurance policy analysis
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export const SYSTEM_PROMPT = `You are the core AI reasoning engine for a FinTech / InsurTech system called
"PolicyLens – AI-Powered Insurance Policy Explainer".

Your role is NOT to act as a generic chatbot.
Your role is to safely, accurately, and clearly explain insurance policies to non-technical users,
with the primary goal of preventing misunderstanding and claim-related financial loss.

------------------------------------
CORE OBJECTIVE
------------------------------------
Transform complex insurance policy language into:
- Plain-language explanations
- Highlighted claim-impacting exclusions and conditions
- Clear, human-readable insights
WITHOUT adding information that does not exist in the policy.

You must prioritize CLARITY, ACCURACY, and USER UNDERSTANDING over verbosity.

------------------------------------
INPUT YOU WILL RECEIVE
------------------------------------
1. Cleaned insurance policy text (already extracted and pre-processed)
2. Structured sections (coverage, exclusions, conditions, waiting periods, claims)
3. Optional user question related to the policy

You must ONLY use the provided policy text as your source of truth.

------------------------------------
MANDATORY OPERATING RULES
------------------------------------
1. Do NOT hallucinate or infer coverage.
2. Do NOT provide legal advice.
3. Do NOT assume intent or user situation.
4. Do NOT add examples unless they directly clarify existing text.
5. If information is unclear or missing, explicitly say:
   "This is not clearly specified in the policy."

------------------------------------
STEP-BY-STEP REASONING FLOW
------------------------------------

STEP 1: UNDERSTAND CONTEXT
- Identify which policy section you are handling
- Detect whether the text is coverage, exclusion, condition, or procedural

STEP 2: DETECT CLAIM-IMPACTING CLAUSES
Pay special attention to:
- Exclusions
- Waiting periods
- Conditional language ("only if", "subject to", "provided that")
- Time limits and claim deadlines

These clauses must always be surfaced prominently.

STEP 3: TRANSLATE INTO PLAIN LANGUAGE
- Rewrite content as if explaining to a non-technical adult
- Use short sentences
- Avoid legal jargon
- If a legal term is unavoidable, explain it immediately

STEP 4: EXPLAIN IMPACT (NOT JUST MEANING)
For each important clause, explain:
- What it restricts
- When it applies
- How it could affect a claim outcome

Use the format:
Clause → Simple explanation → Why this matters

STEP 5: ASSIGN RISK CONTEXT (LOGIC-BASED)
Based on strictness and frequency of exclusions:
- Low Risk: Clear coverage, minimal restrictions
- Medium Risk: Conditional coverage, some exclusions
- High Risk: Strict exclusions, long waiting periods, vague terms

Risk labels must be explainable and justified.

STEP 6: FORMAT OUTPUT FOR UI
Produce output in:
- Bullet points
- Short paragraphs
- Clear headings
- "Why this matters" callouts

Do NOT output long essays.

------------------------------------
CHAT ASSISTANT BEHAVIOR (IF QUESTION IS ASKED)
------------------------------------
When answering user questions:
- Answer ONLY using relevant policy sections
- Be precise and concise
- If the answer depends on conditions, clearly state them
- If the policy does not answer the question, say so clearly

Never speculate.

------------------------------------
PRIVACY & ETHICS
------------------------------------
- Treat all policy text as sensitive
- Do not retain or recall previous user data
- Do not reference other users or policies
- Assume all outputs may be shown to judges or regulators

------------------------------------
SUCCESS CRITERIA
------------------------------------
A successful response makes the user think:
"I finally understand what this policy actually does and does not cover."

Not:
"The AI sounds smart."

------------------------------------
REMEMBER
------------------------------------
You are not here to impress.
You are here to PREVENT misunderstanding and financial harm.
Clarity beats cleverness.`;

/**
 * Analysis Request Schema
 */
export interface AnalysisRequest {
  policyText: string;
  policyType?: "Health" | "Life" | "Auto" | "Home" | "Travel";
  specificQuestion?: string;
}

/**
 * Structured AI Analysis Response
 */
export interface AIAnalysisResponse {
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
 * Chat Question Response
 */
export interface ChatResponse {
  answer: string;
  relevantClauses: string[];
  confidence: "High" | "Medium" | "Low";
  disclaimer?: string;
}

/**
 * Analyzes insurance policy using AI with Google Gemini
 */
export async function analyzePolicyWithAI(
  request: AnalysisRequest
): Promise<AIAnalysisResponse> {
  const config = getAIConfig();
  
  // Use Gemini if API key is configured
  if (config.provider === "gemini" && config.apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ 
        model: config.model || "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const prompt = `${SYSTEM_PROMPT}

------------------------------------
USER POLICY TEXT
------------------------------------
${request.policyText}

------------------------------------
POLICY TYPE
------------------------------------
${request.policyType || "General Insurance"}

------------------------------------
TASK
------------------------------------
Analyze this insurance policy and provide a structured JSON response with:
1. summary: Plain-language overview (2-3 sentences)
2. riskLevel: "Low", "Medium", or "High"
3. riskJustification: Why this risk level (1 sentence)
4. keyExclusions: Array of major exclusions in plain language
5. hiddenClauses: Array of conditional clauses that could block claims
6. claimRequirements: Array of what user must do to file a claim
7. waitingPeriods: Array of {condition, duration} objects
8. conditions: Array of {clause, plainLanguage, impact} objects

Respond ONLY with valid JSON. No markdown, no explanation.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return JSON.parse(text) as AIAnalysisResponse;
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fall through to mock response
    }
  }
  
  // Mock response for demo/fallback
  return {
    summary: "This health insurance policy covers hospitalization expenses after a 36-month waiting period for pre-existing conditions. It includes room rent caps and requires 48-hour claim notification.",
    riskLevel: "Medium",
    riskJustification: "Long waiting periods and strict notification requirements could delay or block valid claims.",
    keyExclusions: [
      "Pre-existing diseases (first 36 months)",
      "Cosmetic treatments and experimental procedures",
      "Self-inflicted injuries and substance abuse",
    ],
    hiddenClauses: [
      "Room rent limited to 1% of sum insured per day",
      "Claims must be filed within 48 hours of hospitalization",
      "Medical records older than 5 years may be requested",
    ],
    claimRequirements: [
      "Notify insurer within 48 hours",
      "Submit original hospital bills and discharge summary",
      "Provide past medical records if requested",
    ],
    waitingPeriods: [
      { condition: "Pre-existing diseases", duration: "36 months" },
      { condition: "Specific procedures (e.g., cataract)", duration: "24 months" },
    ],
    conditions: [
      {
        clause: "Sub-limit on room rent",
        plainLanguage: "Daily room charges cannot exceed 1% of your total coverage amount",
        impact: "If you choose an expensive room, excess charges will not be covered",
      },
    ],
  };
}

/**
 * Answers specific policy questions using AI with Google Gemini
 */
export async function answerPolicyQuestion(
  policyText: string,
  question: string
): Promise<ChatResponse> {
  const config = getAIConfig();
  
  // Use Gemini if API key is configured
  if (config.provider === "gemini" && config.apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ 
        model: config.model || "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const prompt = `${SYSTEM_PROMPT}

------------------------------------
POLICY TEXT
------------------------------------
${policyText}

------------------------------------
USER QUESTION
------------------------------------
${question}

------------------------------------
TASK
------------------------------------
Answer the user's question using ONLY the policy text provided.
Respond with JSON containing:
1. answer: Direct answer in plain language (2-3 sentences max)
2. relevantClauses: Array of exact policy clauses that support the answer
3. confidence: "High" (clearly stated), "Medium" (implied/conditional), or "Low" (unclear)
4. disclaimer: Optional warning if conditions apply

Respond ONLY with valid JSON.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return JSON.parse(text) as ChatResponse;
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fall through to mock response
    }
  }

  // Mock response based on common questions
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes("dengue") || lowerQuestion.includes("disease")) {
    return {
      answer: "Dengue is typically covered after the initial 30-day waiting period, but may have sub-limits. Check if room rent caps apply during treatment.",
      relevantClauses: [
        "Waiting Period: Claims covered after 30 days from policy start",
        "Room rent limited to 1% of sum insured per day",
      ],
      confidence: "High",
      disclaimer: "Coverage may be affected by room rent sub-limits",
    };
  }

  if (lowerQuestion.includes("late") || lowerQuestion.includes("claim")) {
    return {
      answer: "Claims must be filed within 48 hours of hospitalization. Late filing can lead to delays, partial rejection, or denial. Always keep proof of notification.",
      relevantClauses: [
        "48-hour intimation requirement from hospitalization",
        "Insurer reserves right to reject delayed claims",
      ],
      confidence: "High",
      disclaimer: "Exceptions may apply in emergencies - contact insurer immediately",
    };
  }

  return {
    answer: "This depends on specific policy terms. The clause might cover the event, but conditions like waiting periods, documentation, and timelines decide claim approval.",
    relevantClauses: ["Refer to policy exclusions and conditions section"],
    confidence: "Medium",
    disclaimer: "Please provide more specific details for a precise answer",
  };
}

/**
 * Configuration for AI API (set via environment variables)
 */
export interface AIConfig {
  provider: "openai" | "anthropic" | "gemini" | "mock";
  apiKey?: string;
  model?: string;
}

export function getAIConfig(): AIConfig {
  return {
    provider: (process.env.AI_PROVIDER as any) || "mock",
    apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY,
    model: process.env.AI_MODEL || "gemini-flash-latest",
  };
}
