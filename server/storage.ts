import { 
  type User, 
  type InsertUser,
  type PolicyAnalysis,
  type InsertPolicyAnalysis,
  type ClauseKnowledge,
  type InsertClauseKnowledge,
  type UserInsight,
  type InsertUserInsight,
  type AnalysisSession,
  type InsertAnalysisSession,
} from "@shared/schema";
import { randomUUID } from "crypto";

// ============================================================================
// STORAGE INTERFACE - Comprehensive data access layer
// ============================================================================

export interface IStorage {
  // ==================== USER METHODS ====================
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  
  // ==================== POLICY ANALYSIS METHODS ====================
  createPolicyAnalysis(analysis: InsertPolicyAnalysis): Promise<PolicyAnalysis>;
  getPolicyAnalysis(id: string): Promise<PolicyAnalysis | undefined>;
  getUserPolicyAnalyses(userId: string, limit?: number): Promise<PolicyAnalysis[]>;
  deletePolicyAnalysis(id: string, userId: string): Promise<boolean>;
  
  // ==================== CLAUSE KNOWLEDGE METHODS ====================
  getClauseByText(clauseText: string): Promise<ClauseKnowledge | undefined>;
  createClause(clause: InsertClauseKnowledge): Promise<ClauseKnowledge>;
  incrementClauseUsage(id: string): Promise<void>;
  getTopClauses(limit?: number): Promise<ClauseKnowledge[]>;
  
  // ==================== USER INSIGHTS METHODS ====================
  createUserInsight(insight: InsertUserInsight): Promise<UserInsight>;
  getInsightsByCategory(category: string, limit?: number): Promise<UserInsight[]>;
  
  // ==================== SESSION METHODS ====================
  createSession(session: InsertAnalysisSession): Promise<AnalysisSession>;
  getSessionByToken(token: string): Promise<AnalysisSession | undefined>;
  updateSessionActivity(id: string, policiesAnalyzed: number, questionsAsked: number): Promise<void>;
  cleanExpiredSessions(): Promise<void>;
}

// ============================================================================
// IN-MEMORY STORAGE - For development/demo (replace with DB in production)
// ============================================================================

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private policyAnalyses: Map<string, PolicyAnalysis>;
  private clauses: Map<string, ClauseKnowledge>;
  private insights: UserInsight[];
  private sessions: Map<string, AnalysisSession>;

  constructor() {
    this.users = new Map();
    this.policyAnalyses = new Map();
    this.clauses = new Map();
    this.insights = [];
    this.sessions = new Map();
  }

  // ==================== USER METHODS ====================
  
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      password: insertUser.password ?? null,
      googleId: insertUser.googleId ?? null,
      name: insertUser.name ?? null,
      email: insertUser.email ?? null,
      preferredLanguage: insertUser.preferredLanguage ?? "en",
      createdAt: new Date(),
      lastLoginAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
    }
  }

  // ==================== POLICY ANALYSIS METHODS ====================
  
  async createPolicyAnalysis(analysis: InsertPolicyAnalysis): Promise<PolicyAnalysis> {
    const id = randomUUID();
    const policyAnalysis: PolicyAnalysis = {
      ...analysis,
      id,
      userId: analysis.userId ?? null,
      insuranceProvider: analysis.insuranceProvider ?? null,
      waitingPeriodDays: analysis.waitingPeriodDays ?? null,
      coverageLimitAmount: analysis.coverageLimitAmount ?? null,
      majorExclusions: analysis.majorExclusions ?? null,
      claimRequirements: analysis.claimRequirements ?? null,
      analyzedAt: new Date(),
    };
    this.policyAnalyses.set(id, policyAnalysis);
    return policyAnalysis;
  }

  async getPolicyAnalysis(id: string): Promise<PolicyAnalysis | undefined> {
    return this.policyAnalyses.get(id);
  }

  async getUserPolicyAnalyses(userId: string, limit = 10): Promise<PolicyAnalysis[]> {
    return Array.from(this.policyAnalyses.values())
      .filter((analysis) => analysis.userId === userId)
      .sort((a, b) => b.analyzedAt.getTime() - a.analyzedAt.getTime())
      .slice(0, limit);
  }

  async deletePolicyAnalysis(id: string, userId: string): Promise<boolean> {
    const analysis = this.policyAnalyses.get(id);
    if (analysis && analysis.userId === userId) {
      this.policyAnalyses.delete(id);
      return true;
    }
    return false;
  }

  // ==================== CLAUSE KNOWLEDGE METHODS ====================
  
  async getClauseByText(clauseText: string): Promise<ClauseKnowledge | undefined> {
    return Array.from(this.clauses.values()).find(
      (clause) => clause.clauseText === clauseText,
    );
  }

  async createClause(clause: InsertClauseKnowledge): Promise<ClauseKnowledge> {
    const id = randomUUID();
    const clauseKnowledge: ClauseKnowledge = {
      ...clause,
      id,
      realWorldExample: clause.realWorldExample ?? null,
      frequencyCount: clause.frequencyCount ?? 1,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };
    this.clauses.set(id, clauseKnowledge);
    return clauseKnowledge;
  }

  async incrementClauseUsage(id: string): Promise<void> {
    const clause = this.clauses.get(id);
    if (clause) {
      clause.frequencyCount++;
      clause.lastUsedAt = new Date();
    }
  }

  async getTopClauses(limit = 20): Promise<ClauseKnowledge[]> {
    return Array.from(this.clauses.values())
      .sort((a, b) => b.frequencyCount - a.frequencyCount)
      .slice(0, limit);
  }

  // ==================== USER INSIGHTS METHODS ====================
  
  async createUserInsight(insight: InsertUserInsight): Promise<UserInsight> {
    const id = randomUUID();
    const userInsight: UserInsight = {
      ...insight,
      id,
      policyId: insight.policyId ?? null,
      isConfused: insight.isConfused ?? 0,
      askedAt: new Date(),
    };
    this.insights.push(userInsight);
    return userInsight;
  }

  async getInsightsByCategory(category: string, limit = 50): Promise<UserInsight[]> {
    return this.insights
      .filter((insight) => insight.category === category)
      .sort((a, b) => b.askedAt.getTime() - a.askedAt.getTime())
      .slice(0, limit);
  }

  // ==================== SESSION METHODS ====================
  
  async createSession(session: InsertAnalysisSession): Promise<AnalysisSession> {
    const id = randomUUID();
    const analysisSession: AnalysisSession = {
      ...session,
      id,
      userId: session.userId ?? null,
      policiesAnalyzed: session.policiesAnalyzed ?? 0,
      questionsAsked: session.questionsAsked ?? 0,
      startedAt: new Date(),
      lastActivityAt: new Date(),
    };
    this.sessions.set(id, analysisSession);
    return analysisSession;
  }

  async getSessionByToken(token: string): Promise<AnalysisSession | undefined> {
    return Array.from(this.sessions.values()).find(
      (session) => session.sessionToken === token,
    );
  }

  async updateSessionActivity(
    id: string,
    policiesAnalyzed: number,
    questionsAsked: number
  ): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.policiesAnalyzed = policiesAnalyzed;
      session.questionsAsked = questionsAsked;
      session.lastActivityAt = new Date();
    }
  }

  async cleanExpiredSessions(): Promise<void> {
    const now = new Date();
    Array.from(this.sessions.entries()).forEach(([id, session]) => {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
      }
    });
  }
}

// Switch between in-memory (development) and PostgreSQL (production) storage
// For production with Supabase, uncomment the line below:
import { DbStorage } from "./db";
export const storage = new DbStorage();

// For development/demo with in-memory storage, use:
// export const storage = new MemStorage();
