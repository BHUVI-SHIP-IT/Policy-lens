import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import type { IStorage } from "./storage";
import type {
  User,
  InsertUser,
  PolicyAnalysis,
  InsertPolicyAnalysis,
  ClauseKnowledge,
  InsertClauseKnowledge,
  UserInsight,
  InsertUserInsight,
  AnalysisSession,
  InsertAnalysisSession,
} from "@shared/schema";

// ============================================================================
// POSTGRESQL STORAGE IMPLEMENTATION
// ============================================================================
// Replace MemStorage with this class in production
// Uncomment and update storage.ts to use: export const storage = new DbStorage();
// ============================================================================

export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(pool, { schema });
  }

  // ==================== USER METHODS ====================

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.googleId, googleId))
      .limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db
      .insert(schema.users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await this.db
      .update(schema.users)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.users.id, id));
  }

  // ==================== POLICY ANALYSIS METHODS ====================

  async createPolicyAnalysis(analysis: InsertPolicyAnalysis): Promise<PolicyAnalysis> {
    const [created] = await this.db
      .insert(schema.policyAnalyses)
      .values(analysis)
      .returning();
    return created;
  }

  async getPolicyAnalysis(id: string): Promise<PolicyAnalysis | undefined> {
    const [analysis] = await this.db
      .select()
      .from(schema.policyAnalyses)
      .where(eq(schema.policyAnalyses.id, id))
      .limit(1);
    return analysis;
  }

  async getUserPolicyAnalyses(userId: string, limit = 10): Promise<PolicyAnalysis[]> {
    return await this.db
      .select()
      .from(schema.policyAnalyses)
      .where(eq(schema.policyAnalyses.userId, userId))
      .orderBy(desc(schema.policyAnalyses.analyzedAt))
      .limit(limit);
  }

  async deletePolicyAnalysis(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.policyAnalyses)
      .where(
        and(
          eq(schema.policyAnalyses.id, id),
          eq(schema.policyAnalyses.userId, userId)
        )
      )
      .returning();
    return result.length > 0;
  }

  // ==================== CLAUSE KNOWLEDGE METHODS ====================

  async getClauseByText(clauseText: string): Promise<ClauseKnowledge | undefined> {
    const [clause] = await this.db
      .select()
      .from(schema.clauseKnowledge)
      .where(eq(schema.clauseKnowledge.clauseText, clauseText))
      .limit(1);
    return clause;
  }

  async createClause(clause: InsertClauseKnowledge): Promise<ClauseKnowledge> {
    const [created] = await this.db
      .insert(schema.clauseKnowledge)
      .values(clause)
      .returning();
    return created;
  }

  async incrementClauseUsage(id: string): Promise<void> {
    const clause = await this.db
      .select()
      .from(schema.clauseKnowledge)
      .where(eq(schema.clauseKnowledge.id, id))
      .limit(1);

    if (clause[0]) {
      await this.db
        .update(schema.clauseKnowledge)
        .set({
          frequencyCount: clause[0].frequencyCount + 1,
          lastUsedAt: new Date(),
        })
        .where(eq(schema.clauseKnowledge.id, id));
    }
  }

  async getTopClauses(limit = 20): Promise<ClauseKnowledge[]> {
    return await this.db
      .select()
      .from(schema.clauseKnowledge)
      .orderBy(desc(schema.clauseKnowledge.frequencyCount))
      .limit(limit);
  }

  // ==================== USER INSIGHTS METHODS ====================

  async createUserInsight(insight: InsertUserInsight): Promise<UserInsight> {
    const [created] = await this.db
      .insert(schema.userInsights)
      .values(insight)
      .returning();
    return created;
  }

  async getInsightsByCategory(category: string, limit = 50): Promise<UserInsight[]> {
    return await this.db
      .select()
      .from(schema.userInsights)
      .where(eq(schema.userInsights.category, category as any))
      .orderBy(desc(schema.userInsights.askedAt))
      .limit(limit);
  }

  // ==================== SESSION METHODS ====================

  async createSession(session: InsertAnalysisSession): Promise<AnalysisSession> {
    const [created] = await this.db
      .insert(schema.analysisSessions)
      .values(session)
      .returning();
    return created;
  }

  async getSessionByToken(token: string): Promise<AnalysisSession | undefined> {
    const [session] = await this.db
      .select()
      .from(schema.analysisSessions)
      .where(eq(schema.analysisSessions.sessionToken, token))
      .limit(1);
    return session;
  }

  async updateSessionActivity(
    id: string,
    policiesAnalyzed: number,
    questionsAsked: number
  ): Promise<void> {
    await this.db
      .update(schema.analysisSessions)
      .set({
        policiesAnalyzed,
        questionsAsked,
        lastActivityAt: new Date(),
      })
      .where(eq(schema.analysisSessions.id, id));
  }

  async cleanExpiredSessions(): Promise<void> {
    await this.db
      .delete(schema.analysisSessions)
      .where(eq(schema.analysisSessions.expiresAt, new Date()));
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Initialize database with sample data for demo purposes
 */
export async function seedDatabase(storage: DbStorage) {
  console.log("🌱 Seeding database with sample data...");

  // Sample clause knowledge
  const sampleClauses = [
    {
      clauseText: "Pre-existing diseases covered only after 36 months",
      simplifiedExplanation: "Chronic conditions you already have (like diabetes or hypertension) won't be covered for claims until 3 years after policy start.",
      realWorldExample: "If you file a diabetes-related claim in year 1 or 2, the insurer may reject it citing the waiting period.",
      category: "Waiting Period" as const,
    },
    {
      clauseText: "Hospitalization must exceed 24 hours",
      simplifiedExplanation: "Short hospital stays under 24 hours may not qualify unless listed under day-care procedures.",
      realWorldExample: "Your cataract surgery might be rejected if you're discharged in 18 hours, unless it's on the day-care list.",
      category: "Condition" as const,
    },
    {
      clauseText: "Cosmetic procedures excluded unless accident-related",
      simplifiedExplanation: "Elective cosmetic treatments are not claimable. Accident-related reconstruction may be covered with proof.",
      realWorldExample: "Rhinoplasty for appearance won't be covered, but nose reconstruction after a car accident might be.",
      category: "Exclusion" as const,
    },
  ];

  for (const clause of sampleClauses) {
    await storage.createClause(clause);
  }

  console.log("✅ Database seeding complete!");
}
