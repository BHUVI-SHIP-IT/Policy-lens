import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

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

  const summary = useMemo(() => {
    return {
      plain:
        "This policy generally covers hospitalization-related expenses, but has important waiting periods and strict claim-notification requirements.",
      meaning:
        "If you have a pre-existing condition or you delay informing the insurer, your claim may be reduced or rejected. Keep documents ready and notify early.",
    };
  }, []);

  const runAnalysis = async () => {
    setStatus("analyzing");
    await new Promise((r) => setTimeout(r, 1100));
    setStatus("done");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-[0.16]" />
      <div className="pointer-events-none fixed inset-0 bg-radial-fade" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 ring-1 ring-border backdrop-blur"
              data-testid="img-dashboard-brand"
            >
              <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-display text-lg leading-none" data-testid="text-dashboard-title">
                PolicyLens
              </div>
              <div className="text-xs text-muted-foreground" data-testid="text-dashboard-subtitle">
                Policy Analysis Dashboard
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="glass rounded-3xl" data-testid="card-policy-input">
            <CardHeader>
              <CardTitle className="text-lg" data-testid="text-policy-input-title">
                Policy input
              </CardTitle>
              <div className="text-sm text-muted-foreground" data-testid="text-policy-input-hint">
                Paste your policy text here (demo text pre-filled).
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
                  disabled={status === "analyzing"}
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="glass rounded-3xl" data-testid="card-summary">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg" data-testid="text-summary-title">
                      Plain-language summary
                    </CardTitle>
                    <div
                      className={
                        "rounded-full px-3 py-1 text-xs ring-1 " +
                        (status === "done"
                          ? "bg-emerald-600/10 text-emerald-800 ring-emerald-600/20"
                          : "bg-primary/10 text-primary ring-primary/20")
                      }
                      data-testid="status-summary"
                    >
                      {status === "done" ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                        </span>
                      ) : status === "analyzing" ? (
                        "Analyzing"
                      ) : (
                        "Demo"
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground" data-testid="text-summary-plain">
                    {summary.plain}
                  </p>
                  <div
                    className="rounded-2xl border bg-white/55 p-4"
                    data-testid="card-meaning"
                  >
                    <div className="text-sm font-semibold" data-testid="text-meaning-title">
                      What this means for you
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground" data-testid="text-meaning-body">
                      {summary.meaning}
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
              <Card className="glass rounded-3xl" data-testid="card-exclusions">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg" data-testid="text-exclusions-title">
                      Highlighted exclusions
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
                  {mockExclusions.map((x, idx) => {
                    const s = riskStyles(x.risk);
                    return (
                      <div
                        key={x.id}
                        className="rounded-2xl border bg-white/55 p-4"
                        data-testid={`row-exclusion-${x.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div
                              className="text-sm font-semibold"
                              data-testid={`text-exclusion-clause-${x.id}`}
                            >
                              {x.clause}
                            </div>
                            <div
                              className="mt-1 text-sm text-muted-foreground"
                              data-testid={`text-exclusion-explain-${x.id}`}
                            >
                              {x.explanation}
                            </div>
                          </div>
                          <div
                            className={
                              "shrink-0 rounded-full px-3 py-1 text-xs ring-1 " +
                              s.badge
                            }
                            data-testid={`status-exclusion-risk-${x.id}`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                              {x.risk} risk
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    className="rounded-2xl border bg-amber-300/20 p-4"
                    data-testid="card-exclusions-note"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                      <div>
                        <div className="text-sm font-semibold" data-testid="text-exclusions-note-title">
                          Judge-friendly insight
                        </div>
                        <div className="mt-1 text-sm text-amber-950/80" data-testid="text-exclusions-note-body">
                          Most claim issues come from exclusions + late intimation. PolicyLens surfaces both instantly.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
