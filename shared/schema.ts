import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  jsonb, 
  integer,
  index,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// ENUMS - Type-safe categorical data
// ============================================================================

export const policyTypeEnum = pgEnum("policy_type", [
  "Health",
  "Vehicle", 
  "Life",
  "Home",
  "Travel",
  "Other"
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "Low",
  "Medium", 
  "High"
]);

export const clauseCategoryEnum = pgEnum("clause_category", [
  "Exclusion",
  "Condition",
  "Waiting Period",
  "Coverage Limit",
  "Claim Requirement"
]);

export const questionCategoryEnum = pgEnum("question_category", [
  "Coverage",
  "Exclusion",
  "Claim",
  "Timing",
  "Documentation",
  "Other"
]);

// ============================================================================
// TABLE 1: USERS - Lightweight, privacy-first user profiles
// ============================================================================
// PRIVACY DESIGN:
// - NO sensitive data (no age, income, phone, Aadhaar, medical history)
// - Minimal retention - only what's needed for personalization
// - Supports both OAuth and guest users
// ============================================================================

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  
  // Authentication identifiers
  username: text("username").notNull().unique(),
  password: text("password"), // null for OAuth users
  googleId: text("google_id").unique(), // null for local users
  
  // Safe profile data
  name: text("name"), // display name from OAuth or user input
  email: text("email").unique(), // for account recovery only
  
  // Future-ready personalization
  preferredLanguage: text("preferred_language").default("en"), // i18n support
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  googleIdIdx: index("users_google_id_idx").on(table.googleId),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  googleId: true,
  name: true,
  email: true,
  preferredLanguage: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================================================
// TABLE 2: POLICY ANALYSES - Core feature showing real platform usage
// ============================================================================
// BUSINESS VALUE:
// - "View Past Analyses" feature
// - Demonstrates repeat user engagement
// - Enables analytics without storing raw PDFs
// ============================================================================

export const policyAnalyses = pgTable("policy_analyses", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  
  // User relationship (nullable for guest sessions during demo)
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  
  // Policy metadata
  policyTitle: text("policy_title").notNull(),
  policyType: policyTypeEnum("policy_type").notNull(),
  insuranceProvider: text("insurance_provider"), // e.g., "HDFC ERGO", "LIC"
  
  // AI-generated insights (NO raw policy text stored permanently)
  plainLanguageSummary: text("plain_language_summary").notNull(),
  extractedExclusions: jsonb("extracted_exclusions").$type<string[]>().notNull(), // Array of exclusion clauses
  extractedConditions: jsonb("extracted_conditions").$type<string[]>().notNull(), // Array of conditions
  riskLevel: riskLevelEnum("risk_level").notNull(),
  
  // Comparison-ready normalized data (future feature hook)
  waitingPeriodDays: integer("waiting_period_days"), // e.g., 30, 90, 1095
  coverageLimitAmount: integer("coverage_limit_amount"), // in base currency
  majorExclusions: jsonb("major_exclusions").$type<string[]>(), // Normalized exclusion list
  claimRequirements: jsonb("claim_requirements").$type<string[]>(), // e.g., ["24h notification", "Medical records"]
  
  // Metadata
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
  
  // Privacy note: Raw policy PDFs are NEVER stored
  // Only AI-extracted summaries persist
}, (table) => ({
  userIdIdx: index("policy_analyses_user_id_idx").on(table.userId),
  typeIdx: index("policy_analyses_type_idx").on(table.policyType),
  analyzedAtIdx: index("policy_analyses_analyzed_at_idx").on(table.analyzedAt),
}));

export const insertPolicyAnalysisSchema = createInsertSchema(policyAnalyses).omit({
  id: true,
  analyzedAt: true,
});

export const selectPolicyAnalysisSchema = createSelectSchema(policyAnalyses);

export type InsertPolicyAnalysis = z.infer<typeof insertPolicyAnalysisSchema>;
export type PolicyAnalysis = typeof policyAnalyses.$inferSelect;

// ============================================================================
// TABLE 3: CLAUSE KNOWLEDGE STORE - Smart reusable explanations
// ============================================================================
// COMPETITIVE ADVANTAGE:
// - "System improves clarity over time without retraining AI"
// - Consistent explanations across similar clauses
// - Demonstrates intelligent caching
// ============================================================================

export const clauseKnowledge = pgTable("clause_knowledge", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  
  // Normalized clause text (deduplicated)
  clauseText: text("clause_text").notNull().unique(),
  
  // Human-readable explanation
  simplifiedExplanation: text("simplified_explanation").notNull(),
  
  // Real-world example for context
  realWorldExample: text("real_world_example"), // e.g., "Your dengue claim might be rejected if..."
  
  // Categorization
  category: clauseCategoryEnum("category").notNull(),
  
  // Usage tracking (shows system learning)
  frequencyCount: integer("frequency_count").default(1).notNull(),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("clause_knowledge_category_idx").on(table.category),
  frequencyIdx: index("clause_knowledge_frequency_idx").on(table.frequencyCount),
}));

export const insertClauseKnowledgeSchema = createInsertSchema(clauseKnowledge).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export type InsertClauseKnowledge = z.infer<typeof insertClauseKnowledgeSchema>;
export type ClauseKnowledge = typeof clauseKnowledge.$inferSelect;

// ============================================================================
// TABLE 4: USER INSIGHTS - Anonymized question patterns
// ============================================================================
// PRIVACY-FIRST DESIGN:
// - NO raw chat logs stored
// - NO personally identifiable information
// - Only normalized question patterns
// PURPOSE: Identify where users struggle to improve UX
// ============================================================================

export const userInsights = pgTable("user_insights", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  
  // Optional policy context (not user-specific)
  policyId: varchar("policy_id", { length: 255 }).references(() => policyAnalyses.id, { onDelete: "set null" }),
  
  // Normalized question (PII removed)
  // Example: "Is <disease> covered?" instead of "Is my diabetes covered?"
  normalizedQuestion: text("normalized_question").notNull(),
  
  // Categorization for analytics
  category: questionCategoryEnum("category").notNull(),
  
  // Sentiment/confusion indicator
  isConfused: integer("is_confused").default(0), // 0 or 1 (boolean alternative)
  
  // Metadata (NO user ID - fully anonymous)
  askedAt: timestamp("asked_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("user_insights_category_idx").on(table.category),
  askedAtIdx: index("user_insights_asked_at_idx").on(table.askedAt),
}));

export const insertUserInsightSchema = createInsertSchema(userInsights).omit({
  id: true,
  askedAt: true,
});

export type InsertUserInsight = z.infer<typeof insertUserInsightSchema>;
export type UserInsight = typeof userInsights.$inferSelect;

// ============================================================================
// TABLE 5: ANALYSIS SESSIONS - Track guest vs logged-in usage
// ============================================================================
// BUSINESS INTELLIGENCE:
// - Measures guest-to-user conversion
// - Tracks feature adoption
// - Session-based for privacy (auto-expire)
// ============================================================================

export const analysisSessions = pgTable("analysis_sessions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  
  // User context (null for guests)
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  
  // Session metadata
  sessionToken: text("session_token").notNull().unique(), // Temporary identifier for guests
  isGuest: integer("is_guest").default(1).notNull(), // 1 = guest, 0 = logged in
  
  // Analytics
  policiesAnalyzed: integer("policies_analyzed").default(0).notNull(),
  questionsAsked: integer("questions_asked").default(0).notNull(),
  
  // Timestamps
  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  
  // Privacy: Sessions expire after 24 hours
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => ({
  userIdIdx: index("analysis_sessions_user_id_idx").on(table.userId),
  sessionTokenIdx: index("analysis_sessions_session_token_idx").on(table.sessionToken),
  expiresAtIdx: index("analysis_sessions_expires_at_idx").on(table.expiresAt),
}));

export const insertAnalysisSessionSchema = createInsertSchema(analysisSessions).omit({
  id: true,
  startedAt: true,
  lastActivityAt: true,
});

export type InsertAnalysisSession = z.infer<typeof insertAnalysisSessionSchema>;
export type AnalysisSession = typeof analysisSessions.$inferSelect;
