import { motion } from "framer-motion";
import { ShieldCheck, Trash2, Calendar, FileText, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePolicyHistory, useDeletePolicyAnalysis } from "@/hooks/use-policy-analysis";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { formatDistance } from "date-fns";

function riskBadge(risk: "Low" | "Medium" | "High") {
  if (risk === "High") {
    return "bg-red-500/10 text-red-700 ring-1 ring-red-500/20";
  }
  if (risk === "Medium") {
    return "bg-amber-400/15 text-amber-900 ring-1 ring-amber-500/25";
  }
  return "bg-emerald-600/10 text-emerald-800 ring-1 ring-emerald-600/20";
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { data: analyses, isLoading } = usePolicyHistory();
  const { mutate: deleteAnalysis } = useDeletePolicyAnalysis();

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign in Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your policy analysis history.
            </p>
            <a href="/api/auth/google">
              <Button className="w-full">Sign in with Google</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-[0.16]" />
      <div className="pointer-events-none fixed inset-0 bg-radial-fade" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 ring-1 ring-border backdrop-blur">
              <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-display text-lg leading-none">
                Analysis History
              </div>
              <div className="text-xs text-muted-foreground">
                Your past policy analyses
              </div>
            </div>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full bg-white/50">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <Card className="glass rounded-3xl p-8">
              <div className="flex items-center justify-center gap-3">
                <Spinner className="h-5 w-5" />
                <span className="text-muted-foreground">Loading your analyses...</span>
              </div>
            </Card>
          ) : !analyses || analyses.length === 0 ? (
            <Card className="glass rounded-3xl p-8">
              <div className="text-center space-y-3">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <div className="text-lg font-semibold">No analyses yet</div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Start analyzing policies to see them here. Your analysis history helps you compare and track policy changes.
                </p>
                <Link href="/dashboard">
                  <Button className="mt-4">Analyze Your First Policy</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {analyses.length} {analyses.length === 1 ? "analysis" : "analyses"} found
              </div>
              
              {analyses.map((analysis, idx) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card className="glass rounded-3xl hover:ring-1 hover:ring-primary/20 transition">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold">{analysis.policyTitle}</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                              {analysis.policyType}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${riskBadge(analysis.riskLevel)}`}>
                              {analysis.riskLevel} Risk
                            </span>
                          </div>

                          {analysis.insuranceProvider && (
                            <div className="text-sm text-muted-foreground">
                              Provider: {analysis.insuranceProvider}
                            </div>
                          )}

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {analysis.plainLanguageSummary}
                          </p>

                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded-2xl border bg-white/55 p-3">
                              <div className="text-xs font-semibold mb-1">Exclusions Found</div>
                              <div className="text-sm text-muted-foreground">
                                {Array.isArray(analysis.extractedExclusions) ? analysis.extractedExclusions.length : 0} exclusions
                              </div>
                            </div>
                            <div className="rounded-2xl border bg-white/55 p-3">
                              <div className="text-xs font-semibold mb-1">Conditions Found</div>
                              <div className="text-sm text-muted-foreground">
                                {Array.isArray(analysis.extractedConditions) ? analysis.extractedConditions.length : 0} conditions
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            Analyzed {formatDistance(new Date(analysis.analyzedAt), new Date(), { addSuffix: true })}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            if (confirm("Delete this analysis?")) {
                              deleteAnalysis(analysis.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
