import { useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  History,
  Upload,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { SkeletonCard, SkeletonExclusion } from "@/components/ui/skeleton-loader";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCreatePolicyAnalysis } from "@/hooks/use-policy-analysis";
import { useAuth } from "@/hooks/use-auth";
import { useAnalysisSession } from "@/hooks/use-session";
import { toast } from "@/hooks/use-toast";
import { useAIAnalysis, type AIAnalysisResult } from "@/hooks/use-ai-analysis";
import { usePDFUpload } from "@/hooks/use-pdf-upload";

const demoPolicy = `HDFC ERGO Health Insurance (Sample Excerpt)

1) Waiting Period: Claims for pre-existing diseases are covered only after 36 months from policy start date.
2) Hospitalization: Expenses covered only if hospitalization exceeds 24 hours.
3) Dengue: Covered after 30-day initial waiting period; subject to sub-limits for room rent.
4) Exclusions: Treatment for cosmetic procedures is not covered unless arising from an accident.
5) Claims: Intimation should be provided within 48 hours of hospitalization; delays may impact claim settlement.`;

type Risk = "Low" | "Medium" | "High";

type Exclusion = {
  id: string;
  clause: string;
  explanation: string;
  risk: Risk;
};

const mockExclusions: Exclusion[] = [
  {
    id: "e1",
    clause: "Pre-existing diseases covered only after 36 months.",
    explanation:
      "If you already have a condition (like diabetes), claims related to it might be rejected until the waiting period ends.",
    risk: "High",
  },
  {
    id: "e2",
    clause: "Hospitalization must exceed 24 hours.",
    explanation:
      "Day-care procedures or shorter stays may not qualify unless specifically listed in the policy.",
    risk: "Medium",
  },
  {
    id: "e3",
    clause: "Claim intimation within 48 hours; delays may impact settlement.",
    explanation:
      "Late communication can lead to extra scrutiny or partial rejections. Save the insurer helpline and notify early.",
    risk: "Medium",
  },
];

function riskStyles(risk: Risk) {
  if (risk === "High") {
    return {
      badge: "bg-red-500/10 text-red-700 ring-red-500/20",
      dot: "bg-red-500",
    };
  }
  if (risk === "Medium") {
    return {
      badge: "bg-amber-400/15 text-amber-900 ring-amber-500/25",
      dot: "bg-amber-500",
    };
  }
  return {
    badge: "bg-emerald-600/10 text-emerald-800 ring-emerald-600/20",
    dot: "bg-emerald-600",
  };
}

export default function DashboardPage() {
  const [policyText, setPolicyText] = useState(demoPolicy);
  const [status, setStatus] = useState<"idle" | "analyzing" | "done">("idle");
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { mutate: createAnalysis, isPending: isSaving } = useCreatePolicyAnalysis();
  const { session, updateActivity } = useAnalysisSession();
  const { mutate: analyzeWithAI, isPending: isAIAnalyzing } = useAIAnalysis();
  const { mutate: uploadPDF, isPending: isUploading } = usePDFUpload();

  const summary = useMemo(() => {
    return {
      plain:
        "This policy generally covers hospitalization-related expenses, but has important waiting periods and strict claim-notification requirements.",
      meaning:
        "If you have a pre-existing condition or you delay informing the insurer, your claim may be reduced or rejected. Keep documents ready and notify early.",
    };
  }, []);

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadPDF(file, {
      onSuccess: (result) => {
        setPolicyText(result.text);
        // Save to localStorage for chat assistant
        localStorage.setItem('currentPolicyText', result.text);
        toast({
          title: "PDF Uploaded!",
          description: `Extracted ${result.numPages} pages from ${result.fileName}`,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const runAnalysis = async () => {
    setStatus("analyzing");
    
    // Save policy text to localStorage for chat assistant
    localStorage.setItem('currentPolicyText', policyText);
    
    // AI-powered analysis using Gemini
    analyzeWithAI({ policyText, policyType: "Health" }, {
      onSuccess: (result) => {
        setAiResult(result);
        setStatus("done");
        
        // Save AI analysis to localStorage for other pages (exclusions, etc.)
        localStorage.setItem('latestAIAnalysis', JSON.stringify(result));
        
        // Save AI-generated analysis to database
        if (user) {
          console.log("Saving analysis for user:", user.id);
          createAnalysis({
            policyTitle: "AI-Analyzed Policy",
            policyType: "Health",
            insuranceProvider: "Various",
            plainLanguageSummary: result.summary,
            extractedExclusions: result.keyExclusions,
            extractedConditions: result.conditions?.map(c => c.clause) || [],
            riskLevel: result.riskLevel,
            waitingPeriodDays: result.waitingPeriods?.[0] ? parseInt(result.waitingPeriods[0].duration) : null,
            coverageLimitAmount: null,
            majorExclusions: result.hiddenClauses,
            claimRequirements: result.claimRequirements,
          }, {
            onSuccess: (savedAnalysis) => {
              console.log("Analysis saved successfully:", savedAnalysis);
              toast({
                title: "AI Analysis Complete!",
                description: "Your policy has been analyzed and saved to history.",
              });
            },
            onError: (error) => {
              console.error("Failed to save analysis:", error);
              toast({
                title: "Analysis Complete",
                description: "AI analysis done but couldn't save to history.",
                variant: "destructive",
              });
            }
          });
        } else {
          console.log("User not logged in - analysis not saved");
          // Even without login, show the AI results
          toast({
            title: "AI Analysis Complete!",
            description: "Sign in to save your analysis to history.",
          });
        }
        
        // Update session activity
        if (session) {
          updateActivity(
            (session.policiesAnalyzed || 0) + 1,
            session.questionsAsked || 0
          );
        }
      },
      onError: (error: Error) => {
        console.error("AI analysis failed:", error);
        toast({
          title: "Analysis failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      }
    });

  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-[0.16]" />
      <div className="pointer-events-none fixed inset-0 bg-radial-fade" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20"
              data-testid="img-dashboard-brand"
            >
              <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" data-testid="text-dashboard-title">
                PolicyLens
              </div>
              <div className="text-sm font-medium text-muted-foreground" data-testid="text-dashboard-subtitle">
                AI-Powered Policy Analysis
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <Link href="/history" data-testid="link-dashboard-history">
                <Button variant="outline" className="rounded-full bg-white/50" data-testid="button-dashboard-history">
                  History
                  <History className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/" data-testid="link-dashboard-home">
              <Button variant="outline" className="rounded-full bg-white/50" data-testid="button-dashboard-home">
                Back
              </Button>
            </Link>
            <Link href="/chat" data-testid="link-dashboard-chat">
              <Button className="rounded-full" data-testid="button-dashboard-chat">
                Ask AI
                <Bot className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          {!user && (
            <div className="lg:col-span-2">
              <Card className="glass rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-amber-900 mb-2">
                        Sign in to Save Your Analysis
                      </h3>
                      <p className="text-sm text-amber-800 mb-4">
                        You can analyze policies without signing in, but your analysis won't be saved to history. Sign in with Google to access all features and track your policy analyses over time.
                      </p>
                      <a href="/api/auth/google">
                        <Button className="bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg">
                          Sign in with Google
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card className="glass rounded-3xl border-2 border-white/60 shadow-xl" data-testid="card-policy-input">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2" data-testid="text-policy-input-title">
                <FileText className="h-5 w-5 text-primary" />
                Policy Input
              </CardTitle>
              <div className="text-sm font-medium text-muted-foreground" data-testid="text-policy-input-hint">
                Paste text or upload a PDF to analyze your insurance policy.
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                className="min-h-[260px] resize-none rounded-2xl bg-white/60"
                placeholder="Paste policy text\u2026"
                data-testid="input-policy-text"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={runAnalysis}
                  className="rounded-2xl"
                  disabled={status === "analyzing" || isUploading}
                  data-testid="button-analyze-policy"
                >
                  {status === "analyzing" ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      AI is analyzing
                    </>
                  ) : (
                    <>
                      Analyze Policy
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl bg-white/50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  data-testid="button-upload-pdf"
                >
                  {isUploading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Uploading
                    </>
                  ) : (
                    <>
                      Upload PDF
                      <Upload className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePDFUpload}
                  className="hidden"
                  data-testid="input-pdf-file"
                />
                <Button
                  variant="outline"
                  className="rounded-2xl bg-white/50"
                  onClick={() => {
                    setPolicyText(demoPolicy);
                    setStatus("idle");
                  }}
                  data-testid="button-load-demo"
                >
                  Load demo
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {status === "analyzing" ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="glass rounded-3xl border-2 border-white/60 shadow-xl bg-gradient-to-br from-white/80 to-blue-50/50" data-testid="card-summary">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-xl font-bold text-foreground" data-testid="text-summary-title">
                      AI Analysis Summary
                    </CardTitle>
                    <div
                      className={
                        "rounded-full px-4 py-1.5 text-sm font-semibold ring-2 shadow-sm " +
                        (status === "done"
                          ? "bg-emerald-500 text-white ring-emerald-600/20 shadow-emerald-500/20"
                          : "bg-gradient-to-r from-primary to-blue-600 text-white ring-primary/20 shadow-primary/20")
                      }
                      data-testid="status-summary"
                    >
                      {status === "done" ? (
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> Complete
                        </span>
                      ) : (
                        "Ready"
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base leading-relaxed font-medium text-foreground" data-testid="text-summary-plain">
                    {aiResult?.summary || summary.plain}
                  </p>
                  <div
                    className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-md"
                    data-testid="card-meaning"
                  >
                    <div className="text-base font-bold text-amber-900 flex items-center gap-2" data-testid="text-meaning-title">
                      <AlertTriangle className="h-5 w-5" />
                      What this means for you
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-amber-800" data-testid="text-meaning-body">
                      {aiResult?.riskJustification || summary.meaning}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            >
              <Card className="glass rounded-3xl border-2 border-white/60 shadow-xl" data-testid="card-exclusions">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2" data-testid="text-exclusions-title">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Key Exclusions & Clauses
                    </CardTitle>
                    <Link href="/exclusions" data-testid="link-exclusions-view">
                      <Button variant="outline" className="rounded-full bg-white/50" data-testid="button-exclusions-view">
                        View
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(aiResult ? [...(aiResult.keyExclusions || []).slice(0, 3).map((exc, idx) => ({
                    id: `ai-exc-${idx}`,
                    clause: exc,
                    explanation: aiResult.hiddenClauses?.[idx] || "Important policy restriction",
                    risk: idx === 0 ? "High" as Risk : "Medium" as Risk
                  })), ...(aiResult.hiddenClauses || []).slice(0, 2).map((clause, idx) => ({
                    id: `ai-hidden-${idx}`,
                    clause: clause,
                    explanation: aiResult.conditions?.[idx]?.plainLanguage || "Review this clause carefully",
                    risk: "Medium" as Risk
                  }))] : mockExclusions).map((x, idx) => {
                    const s = riskStyles(x.risk);
                    const gradientClass = x.risk === "High" 
                      ? "bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 shadow-md shadow-red-100"
                      : x.risk === "Medium"
                      ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-md shadow-amber-100"
                      : "bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-md shadow-emerald-100";
                    return (
                      <div
                        key={x.id}
                        className={`rounded-2xl p-5 ${gradientClass}`}
                        data-testid={`row-exclusion-${x.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div
                              className="text-base font-bold text-foreground"
                              data-testid={`text-exclusion-clause-${x.id}`}
                            >
                              {x.clause}
                            </div>
                            <div
                              className="mt-2 text-sm leading-relaxed text-muted-foreground"
                              data-testid={`text-exclusion-explain-${x.id}`}
                            >
                              {x.explanation}
                            </div>
                          </div>
                          <div
                            className={
                              "shrink-0 rounded-full px-4 py-2 text-sm font-bold shadow-sm ring-2 " +
                              s.badge
                            }
                            data-testid={`status-exclusion-risk-${x.id}`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${s.dot} animate-pulse`} />
                              {x.risk}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
              </>
            )}

            {/* Risk Gauge Card */}
            {status === "done" && aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                <Card className="glass rounded-3xl border-2 border-white/60 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RiskGauge riskLevel={aiResult.riskLevel} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          onAnalyze={runAnalysis}
          onUpload={() => fileInputRef.current?.click()}
          onChat={() => navigate('/chat')}
        />
      </div>
    </div>
  );
}
