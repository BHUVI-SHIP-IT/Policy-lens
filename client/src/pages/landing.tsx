import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  FileText,

  MessageCircle,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-[0.16]" />
      <div className="pointer-events-none fixed inset-0 bg-radial-fade" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}

import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

function TopNav() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20"
          data-testid="img-brandmark"
        >
          <div className="relative">
            <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
            <Sparkles
              className="absolute -right-2 -top-2 h-4 w-4 text-yellow-300 animate-pulse"
              strokeWidth={2.5}
            />
          </div>
        </div>
        <div>
          <div className="font-display text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" data-testid="text-app-name">
            PolicyLens
          </div>
          <div
            className="text-xs font-medium text-muted-foreground"
            data-testid="text-app-tagline"
          >
            AI-Powered Policy Analysis
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <a
          href="#how"
          className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          data-testid="link-how-it-works"
        >
          How it works
        </a>
        <a
          href="#impact"
          className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          data-testid="link-impact"
        >
          Impact
        </a>
        {user ? (
          <>
            <Link href="/dashboard" data-testid="link-dashboard">
              <Button className="rounded-full" data-testid="button-nav-analyze">
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => logout()}
              data-testid="button-nav-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <a href="/api/auth/google">
            <Button className="rounded-full" data-testid="button-nav-signin">
              Sign in with Google
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >


        <h1
          className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          data-testid="text-hero-headline"
        >
          Understand Your Insurance.
          <span className="block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
            Before It's Too Late.
          </span>
        </h1>

        <p
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl font-medium"
          data-testid="text-hero-subheading"
        >
          PolicyLens uses advanced AI to simplify complex insurance policies, uncover hidden
          exclusions, and empower you with clarity.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/dashboard" data-testid="link-hero-analyze">
            <Button
              className="rounded-full px-8 py-6 text-lg font-bold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all bg-gradient-to-r from-primary to-blue-600"
              data-testid="button-hero-analyze"
            >
              Analyze Policy Now
              <Wand2 className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard" data-testid="link-hero-demo">
            <Button
              variant="outline"
              className="rounded-full bg-white/80 px-6 py-6 text-lg font-semibold border-2 hover:bg-white hover:scale-105 transition-all"
              data-testid="button-hero-demo"
            >
              Try Demo
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <BadgeCheck className="h-5 w-5 text-emerald-600" />,
              title: "Trust-first",
              desc: "Clear, judge-friendly insights",
              tid: "card-benefit-trust",
              gradient: "from-emerald-50 to-green-50 border-emerald-200"
            },
            {
              icon: <FileText className="h-5 w-5 text-blue-600" />,
              title: "Plain language",
              desc: "No legal jargon overload",
              tid: "card-benefit-plain",
              gradient: "from-blue-50 to-indigo-50 border-blue-200"
            },
            {
              icon: <Bot className="h-5 w-5 text-purple-600" />,
              title: "AI assistant",
              desc: "Ask anything, get clarity",
              tid: "card-benefit-ai",
              gradient: "from-purple-50 to-pink-50 border-purple-200"
            },
          ].map((b) => (
            <div
              key={b.title}
              className={`rounded-2xl p-5 border-2 bg-gradient-to-br ${b.gradient} shadow-md hover:shadow-lg hover:scale-105 transition-all`}
              data-testid={b.tid}
            >
              <div className="flex items-center gap-2.5 text-base font-bold">
                {b.icon}
                <span data-testid={`text-benefit-title-${b.title}`}>{b.title}</span>
              </div>
              <div
                className="mt-2 text-sm font-medium text-muted-foreground"
                data-testid={`text-benefit-desc-${b.title}`}
              >
                {b.desc}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="relative"
      >
        <div className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-primary/15 via-emerald-500/10 to-amber-300/15 blur-2xl" />
        <div className="relative glass ring-glow rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="grid h-9 w-9 place-items-center rounded-2xl bg-white/70 ring-1 ring-border"
                data-testid="img-hero-icon"
              >
                <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-sm font-medium" data-testid="text-hero-card-title">
                  Live Policy Snapshot
                </div>
                <div className="text-xs text-muted-foreground" data-testid="text-hero-card-subtitle">
                  What users actually need to know
                </div>
              </div>
            </div>
            <div
              className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs text-emerald-800 ring-1 ring-emerald-600/20"
              data-testid="status-hero-safe"
            >
              Trusted Summary
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border bg-white/55 p-4"
                data-testid={`card-hero-insight-${i}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold" data-testid={`text-hero-insight-title-${i}`}>
                    {i === 0
                      ? "Coverage clarity"
                      : i === 1
                        ? "Hidden exclusions"
                        : "Actionable guidance"}
                  </div>
                  <div
                    className={
                      "rounded-full px-2 py-0.5 text-[11px] ring-1 " +
                      (i === 1
                        ? "bg-amber-400/15 text-amber-900 ring-amber-500/25"
                        : "bg-primary/10 text-primary ring-primary/20")
                    }
                    data-testid={`status-hero-chip-${i}`}
                  >
                    {i === 1 ? "Watch" : "Clear"}
                  </div>
                </div>
                <div
                  className="mt-2 text-sm text-muted-foreground"
                  data-testid={`text-hero-insight-body-${i}`}
                >
                  {i === 0
                    ? "We summarize benefits in plain language so users don’t miss what’s covered."
                    : i === 1
                      ? "We surface exclusions and waiting periods that cause claim rejections."
                      : "We explain what clauses mean for real-life decisions and claim scenarios."}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/exclusions" data-testid="link-hero-exclusions">
              <Button
                variant="outline"
                className="w-full rounded-2xl bg-white/55"
                data-testid="button-hero-exclusions"
              >
                Exclusion View
                <FileText className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/chat" data-testid="link-hero-chat">
              <Button
                className="w-full rounded-2xl"
                data-testid="button-hero-chat"
              >
                Ask the Assistant
                <MessageCircle className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Upload or paste policy text",
      desc: "Bring any policy wording \u2014 PDF text, email copy, or brochure terms.",
      icon: Upload,
      tid: "card-step-1",
    },
    {
      title: "AI analyzes clauses & exclusions",
      desc: "We identify waiting periods, claim conditions, and tricky clauses.",
      icon: Sparkles,
      tid: "card-step-2",
    },
    {
      title: "Plain summary + risk flags",
      desc: "Get a readable summary and a clear list of what to watch out for.",
      icon: ShieldCheck,
      tid: "card-step-3",
    },
  ];

  return (
    <div className="mt-16" id="how">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUp}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <div
              className="text-sm font-medium text-primary"
              data-testid="text-how-eyebrow"
            >
              How it works
            </div>
            <h2
              className="mt-2 font-display text-3xl tracking-tight"
              data-testid="text-how-title"
            >
              From policy text to clarity in minutes.
            </h2>
          </div>
          <Link href="/dashboard" data-testid="link-how-cta">
            <Button variant="outline" className="rounded-full bg-white/50" data-testid="button-how-cta">
              Try the dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {steps.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: idx * 0.08 }}
            >
              <Card className="glass rounded-3xl" data-testid={s.tid}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div
                      className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 ring-1 ring-border"
                      data-testid={`img-step-icon-${idx + 1}`}
                    >
                      <s.icon className="h-5 w-5 text-primary" strokeWidth={2.2} />
                    </div>
                    <div
                      className="text-xs text-muted-foreground"
                      data-testid={`text-step-number-${idx + 1}`}
                    >
                      Step {idx + 1}
                    </div>
                  </div>
                  <CardTitle className="mt-3 text-lg" data-testid={`text-step-title-${idx + 1}`}>
                    {s.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground" data-testid={`text-step-desc-${idx + 1}`}>
                  {s.desc}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 hidden items-center justify-center lg:flex">
          <div className="flex w-full max-w-4xl items-center gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="relative flex-1">
                <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-primary/25 via-emerald-500/25 to-primary/25" />
                <motion.div
                  className="absolute left-0 top-1/2 h-[2px] w-1/2 -translate-y-1/2 rounded-full bg-primary"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "55%" }}
                  viewport={{ once: true, margin: "-160px" }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 }}
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Impact() {
  const cards = [
    {
      title: "Prevents claim surprises",
      desc: "Highlights exclusions and waiting periods early.",
      icon: ShieldCheck,
      tid: "card-impact-surprises",
    },
    {
      title: "Improves financial confidence",
      desc: "Plain-language clarity helps better decisions.",
      icon: BadgeCheck,
      tid: "card-impact-confidence",
    },
    {
      title: "Citizen-centric FinTech",
      desc: "Aligned with transparency and consumer protection.",
      icon: Sparkles,
      tid: "card-impact-citizen",
    },
  ];

  return (
    <div className="mt-16" id="impact">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={fadeUp}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-primary" data-testid="text-impact-eyebrow">
              Impact & value
            </div>
            <h2 className="mt-2 font-display text-3xl tracking-tight" data-testid="text-impact-title">
              Built for trust, clarity, and better outcomes.
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {cards.map((c, idx) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: idx * 0.08 }}
            >
              <div className="glass rounded-3xl p-5" data-testid={c.tid}>
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 ring-1 ring-border"
                    data-testid={`img-impact-icon-${idx}`}
                  >
                    <c.icon className="h-5 w-5 text-emerald-700" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="text-base font-semibold" data-testid={`text-impact-title-${idx}`}>
                      {c.title}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground" data-testid={`text-impact-desc-${idx}`}>
                      {c.desc}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-16 border-t border-border/70 py-10">
      <div className="flex justify-center">
        <div className="font-display text-lg" data-testid="text-footer-name">
          PolicyLens
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Shell>
      <TopNav />
      <Hero />
      <HowItWorks />
      <Impact />
      <Footer />
    </Shell>
  );
}
