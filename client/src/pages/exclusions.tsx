import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Risk = "Low" | "Medium" | "High";

type Item = {
  id: string;
  clause: string;
  explanation: string;
  risk: Risk;
};

function riskStyles(risk: Risk) {
  if (risk === "High") {
    return {
      badge: "bg-red-500/10 text-red-700 ring-red-500/20",
      bar: "bg-red-500/70",
      highlight: "bg-red-500/10",
    };
  }
  if (risk === "Medium") {
    return {
      badge: "bg-amber-400/15 text-amber-900 ring-amber-500/25",
      bar: "bg-amber-500/70",
      highlight: "bg-amber-400/15",
    };
  }
  return {
    badge: "bg-emerald-600/10 text-emerald-800 ring-emerald-600/20",
    bar: "bg-emerald-600/70",
    highlight: "bg-emerald-600/10",
  };
}

export default function ExclusionsPage() {
  const [aiAnalysisData, setAiAnalysisData] = useState<any>(null);

  // Load AI analysis from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('latestAIAnalysis');
    if (stored) {
      try {
        setAiAnalysisData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse AI analysis:', e);
      }
    }
  }, []);

  const items: Item[] = useMemo(() => {
    // If we have AI data, use it
    if (aiAnalysisData) {
      const aiItems: Item[] = [];
      
      // Add key exclusions
      (aiAnalysisData.keyExclusions || []).slice(0, 3).forEach((exc: string, idx: number) => {
        aiItems.push({
          id: `ai-exc-${idx}`,
          clause: exc,
          explanation: aiAnalysisData.hiddenClauses?.[idx] || "Important policy restriction identified by AI",
          risk: idx === 0 ? "High" : "Medium",
        });
      });
      
      // Add hidden clauses
      (aiAnalysisData.hiddenClauses || []).slice(0, 2).forEach((clause: string, idx: number) => {
        aiItems.push({
          id: `ai-hidden-${idx}`,
          clause: clause,
          explanation: aiAnalysisData.conditions?.[idx]?.plainLanguage || aiAnalysisData.conditions?.[idx]?.impact || "Review this clause carefully",
          risk: "Medium",
        });
      });

      if (aiItems.length > 0) return aiItems;
    }

    // Fallback to demo data
    return [
      {
        id: "c1",
        clause: "Pre-existing diseases: covered only after 36 months.",
        explanation:
          "If you already have a condition (e.g., diabetes), claims related to it may be denied until the waiting period ends.",
        risk: "High",
      },
      {
        id: "c2",
        clause: "Hospitalization must exceed 24 hours to qualify.",
        explanation:
          "Short admissions can be rejected unless listed under day-care procedures. Check the specific list in your policy.",
        risk: "Medium",
      },
      {
        id: "c3",
        clause: "Cosmetic procedures are excluded unless due to an accident.",
        explanation:
          "Elective cosmetic treatments are usually not claimable. Accident-related reconstruction may be covered with proof.",
        risk: "Low",
      },
      {
        id: "c4",
        clause: "Claim intimation must be made within 48 hours of hospitalization.",
        explanation:
          "Late intimation can lead to delays, extra documentation, or partial rejection. Inform the insurer as early as possible.",
        risk: "Medium",
      },
    ];
  }, [aiAnalysisData]);

  const [active, setActive] = useState<Item>(items[0]);
  const [filter, setFilter] = useState<"All" | Risk>("All");

  const filteredItems = filter === "All" ? items : items.filter(it => it.risk === filter);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-[0.16]" />
      <div className="pointer-events-none fixed inset-0 bg-radial-fade" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 ring-1 ring-border backdrop-blur"
              data-testid="img-exclusions-brand"
            >
              <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-display text-lg leading-none" data-testid="text-exclusions-title">
                Exclusion Highlight View
              </div>
              <div className="text-xs text-muted-foreground" data-testid="text-exclusions-subtitle">
                Clause-by-clause explanation with risk indicators
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard" data-testid="link-exclusions-dashboard">
              <Button variant="outline" className="rounded-full bg-white/50" data-testid="button-exclusions-dashboard">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="glass rounded-3xl" data-testid="card-exclusion-list">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg" data-testid="text-list-title">
                  Clauses flagged by AI
                </CardTitle>
                <div className="flex items-center gap-2">
                  {["All", "High", "Medium", "Low"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        filter === f
                          ? "bg-primary text-white shadow-md"
                          : "bg-white/60 text-muted-foreground hover:bg-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-white/60 text-muted-foreground transition hover:text-foreground"
                        data-testid="button-tooltip-why"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8} data-testid="text-tooltip-why">
                      This list is auto-generated by scanning policy wording for exclusions, waiting periods, and claim conditions.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredItems.map((it) => {
                const s = riskStyles(it.risk);
                const isActive = active.id === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => setActive(it)}
                    className={
                      "w-full rounded-2xl border p-4 text-left transition " +
                      (isActive
                        ? "bg-white/70 ring-1 ring-primary/25"
                        : "bg-white/55 hover:bg-white/65")
                    }
                    data-testid={`button-select-clause-${it.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold" data-testid={`text-clause-title-${it.id}`}>
                          {it.clause}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground" data-testid={`text-clause-riskhint-${it.id}`}>
                          Risk: {it.risk}
                        </div>
                      </div>
                      <div
                        className={
                          "shrink-0 rounded-full px-3 py-1 text-xs ring-1 " +
                          s.badge
                        }
                        data-testid={`status-clause-badge-${it.id}`}
                      >
                        {it.risk}
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="glass rounded-3xl" data-testid="card-exclusion-detail">
              <CardHeader>
                <CardTitle className="text-lg" data-testid="text-detail-title">
                  Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-2xl border bg-white/55">
                  <div className="h-1.5 w-full bg-muted">
                    <div
                      className={"h-1.5 " + riskStyles(active.risk).bar}
                      style={{ width: active.risk === "High" ? "88%" : active.risk === "Medium" ? "62%" : "36%" }}
                      data-testid="bar-risk"
                    />
                  </div>
                  <div
                    className={"p-4 text-sm font-semibold " + riskStyles(active.risk).highlight}
                    data-testid="text-detail-clause"
                  >
                    {active.clause}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white/55 p-4" data-testid="card-detail-explanation">
                  <div className="text-sm font-semibold" data-testid="text-detail-meaning-title">
                    Simple explanation
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground" data-testid="text-detail-meaning-body">
                    {active.explanation}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white/55 p-4" data-testid="card-detail-why">
                  <div className="text-sm font-semibold" data-testid="text-detail-why-title">
                    Why it matters
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground" data-testid="text-detail-why-body">
                    Policies often deny claims not because coverage is absent, but because a clause adds conditions (waiting period, timelines, documentation).
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
