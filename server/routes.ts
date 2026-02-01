import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import passport from "passport";
import { analyzePolicyWithAI, answerPolicyQuestion, type AnalysisRequest } from "./ai-engine";
import multer from "multer";
import { extractTextFromPDF, cleanPDFText } from "./pdf-parser";

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for large insurance policy documents
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // ==================== AUTHENTICATION ROUTES ====================
  
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    async (req, res) => {
      // Update last login timestamp
      if (req.user?.id) {
        await storage.updateUserLastLogin(req.user.id);
      }
      res.redirect("/dashboard");
    }
  );

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).send("Unauthorized");
  });

  // ==================== POLICY ANALYSIS ROUTES ====================
  
  // Create new policy analysis
  app.post("/api/analyses", async (req, res) => {
    try {
      const userId = req.isAuthenticated() ? req.user!.id : null;
      
      const analysis = await storage.createPolicyAnalysis({
        userId,
        policyTitle: req.body.policyTitle,
        policyType: req.body.policyType,
        insuranceProvider: req.body.insuranceProvider,
        plainLanguageSummary: req.body.plainLanguageSummary,
        extractedExclusions: req.body.extractedExclusions,
        extractedConditions: req.body.extractedConditions,
        riskLevel: req.body.riskLevel,
        waitingPeriodDays: req.body.waitingPeriodDays,
        coverageLimitAmount: req.body.coverageLimitAmount,
        majorExclusions: req.body.majorExclusions,
        claimRequirements: req.body.claimRequirements,
      });

      res.json(analysis);
    } catch (error) {
      console.error("Failed to create analysis:", error);
      res.status(500).json({ error: "Failed to create analysis" });
    }
  });

  // Get user's analysis history (requires auth)
  app.get("/api/analyses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const analyses = await storage.getUserPolicyAnalyses(req.user!.id, limit);
      res.json(analyses);
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  // Get specific analysis (requires ownership)
  app.get("/api/analyses/:id", async (req, res) => {
    try {
      const analysis = await storage.getPolicyAnalysis(req.params.id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Check ownership (guests can't retrieve, users must own)
      if (!req.isAuthenticated() || analysis.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
      res.status(500).json({ error: "Failed to fetch analysis" });
    }
  });

  // Delete analysis (requires ownership)
  app.delete("/api/analyses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const deleted = await storage.deletePolicyAnalysis(req.params.id, req.user!.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Analysis not found or access denied" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete analysis:", error);
      res.status(500).json({ error: "Failed to delete analysis" });
    }
  });

  // ==================== CLAUSE KNOWLEDGE ROUTES ====================
  
  // Get or create clause explanation
  app.post("/api/clauses/explain", async (req, res) => {
    try {
      const { clauseText, simplifiedExplanation, category, realWorldExample } = req.body;

      // Check if clause already exists
      let clause = await storage.getClauseByText(clauseText);

      if (clause) {
        // Increment usage count
        await storage.incrementClauseUsage(clause.id);
        res.json({ clause, cached: true });
      } else {
        // Create new clause
        clause = await storage.createClause({
          clauseText,
          simplifiedExplanation,
          category,
          realWorldExample,
        });
        res.json({ clause, cached: false });
      }
    } catch (error) {
      console.error("Failed to process clause:", error);
      res.status(500).json({ error: "Failed to process clause" });
    }
  });

  // Get top clauses (public analytics)
  app.get("/api/clauses/top", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const clauses = await storage.getTopClauses(limit);
      res.json(clauses);
    } catch (error) {
      console.error("Failed to fetch clauses:", error);
      res.status(500).json({ error: "Failed to fetch clauses" });
    }
  });

  // ==================== USER INSIGHTS ROUTES ====================
  
  // Submit anonymized question insight
  app.post("/api/insights", async (req, res) => {
    try {
      const insight = await storage.createUserInsight({
        policyId: req.body.policyId,
        normalizedQuestion: req.body.normalizedQuestion,
        category: req.body.category,
        isConfused: req.body.isConfused ?? 0,
      });

      res.json(insight);
    } catch (error) {
      console.error("Failed to create insight:", error);
      res.status(500).json({ error: "Failed to create insight" });
    }
  });

  // Get insights by category (for analytics/admin)
  app.get("/api/insights/:category", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const insights = await storage.getInsightsByCategory(req.params.category, limit);
      res.json(insights);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // ==================== SESSION MANAGEMENT ROUTES ====================
  
  // Create or retrieve session
  app.post("/api/session", async (req, res) => {
    try {
      const { sessionToken } = req.body;
      
      // Check if session exists
      let session = await storage.getSessionByToken(sessionToken);

      if (!session) {
        // Create new session
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiry

        session = await storage.createSession({
          userId: req.isAuthenticated() ? req.user!.id : null,
          sessionToken,
          isGuest: req.isAuthenticated() ? 0 : 1,
          expiresAt,
          policiesAnalyzed: 0,
          questionsAsked: 0,
        });
      }

      res.json(session);
    } catch (error) {
      console.error("Failed to manage session:", error);
      res.status(500).json({ error: "Failed to manage session" });
    }
  });

  // Update session activity
  app.patch("/api/session/:id", async (req, res) => {
    try {
      const { policiesAnalyzed, questionsAsked } = req.body;
      
      await storage.updateSessionActivity(
        req.params.id,
        policiesAnalyzed,
        questionsAsked
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Cleanup expired sessions (cron job endpoint)
  app.post("/api/session/cleanup", async (req, res) => {
    try {
      await storage.cleanExpiredSessions();
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to cleanup sessions:", error);
      res.status(500).json({ error: "Failed to cleanup sessions" });
    }
  });

  // ==================== AI ANALYSIS ENDPOINTS ====================
  
  /**
   * AI-powered policy analysis
   * POST /api/ai/analyze
   * Body: { policyText, policyType?, specificQuestion? }
   */
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { policyText, policyType, specificQuestion } = req.body;

      if (!policyText || policyText.trim().length < 50) {
        return res.status(400).json({ 
          error: "Policy text is required (minimum 50 characters)" 
        });
      }

      const analysisRequest: AnalysisRequest = {
        policyText,
        policyType,
        specificQuestion,
      };

      const aiAnalysis = await analyzePolicyWithAI(analysisRequest);
      
      res.json(aiAnalysis);
    } catch (error) {
      console.error("AI analysis failed:", error);
      res.status(500).json({ error: "Failed to analyze policy" });
    }
  });

  /**
   * AI chat assistant for policy questions
   * POST /api/ai/chat
   * Body: { policyText, question }
   */
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { policyText, question } = req.body;

      if (!policyText || !question) {
        return res.status(400).json({ 
          error: "Both policyText and question are required" 
        });
      }

      const chatResponse = await answerPolicyQuestion(policyText, question);
      
      res.json(chatResponse);
    } catch (error) {
      console.error("AI chat failed:", error);
      res.status(500).json({ error: "Failed to answer question" });
    }
  });

  /**
   * PDF Upload & Text Extraction
   * POST /api/upload/pdf
   * Accepts: multipart/form-data with 'pdf' file field
   * Returns: { text, numPages, fileName }
   */
  app.post("/api/upload/pdf", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file uploaded" });
      }

      const result = await extractTextFromPDF(req.file.buffer);
      const cleanedText = cleanPDFText(result.text);

      res.json({
        text: cleanedText,
        numPages: result.numPages,
        fileName: req.file.originalname,
        info: result.info,
      });
    } catch (error: any) {
      console.error("PDF upload error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to process PDF" 
      });
    }
  });

  return httpServer;
}
