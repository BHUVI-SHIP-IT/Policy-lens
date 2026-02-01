import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send, ShieldCheck, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Role = "user" | "bot";

type Msg = {
  id: string;
  role: Role;
  text: string;
};

const starter: Msg[] = [
  {
    id: "m1",
    role: "bot",
    text: "Hi! I’m PolicyLens Assistant. Ask me about coverage, exclusions, waiting periods, or claim timelines — I’ll explain in plain language.",
  },
  {
    id: "m2",
    role: "bot",
    text: "Try: “Is dengue covered?” or “What happens if I file a claim late?”",
  },
];

function Bubble({ role, text }: { role: Role; text: string }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={"flex " + (isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={
          "max-w-[86%] rounded-3xl border px-4 py-3 text-sm leading-relaxed shadow-sm " +
          (isUser
            ? "bg-primary text-primary-foreground border-primary/20"
            : "bg-white/70 text-foreground border-border")
        }
        data-testid={isUser ? "bubble-user" : "bubble-bot"}
      >
        {text}
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>(starter);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(
    () => [
      "Is dengue covered?",
      "What happens if I file a claim late?",
      "What does the 36-month waiting period mean?",
    ],
    [],
  );

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text: trimmed };

    const botText =
      trimmed.toLowerCase().includes("dengue")
        ? "Often yes, but usually after the initial waiting period (e.g., 30 days) and sometimes with sub-limits. Check room rent caps and exclusions for outbreaks."
        : trimmed.toLowerCase().includes("late") || trimmed.toLowerCase().includes("intimation")
          ? "Late claim intimation can lead to delays or partial rejection. Best practice: notify the insurer within the policy’s stated window (often 24–48 hours) and keep proof."
          : "In simple terms: the policy might cover the event, but certain conditions (waiting period, timelines, documentation) decide whether the claim is paid. Want me to explain a specific clause?";

    const botMsg: Msg = { id: `b-${Date.now()}`, role: "bot", text: botText };

    setMessages((m) => [...m, userMsg, botMsg]);
    setInput("");

    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-[0.16]" />
      <div className="pointer-events-none fixed inset-0 bg-radial-fade" />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 ring-1 ring-border backdrop-blur"
              data-testid="img-chat-brand"
            >
              <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-display text-lg leading-none" data-testid="text-chat-title">
                AI Chat Assistant
              </div>
              <div className="text-xs text-muted-foreground" data-testid="text-chat-subtitle">
                Friendly, fintech-style explanations
              </div>
            </div>
          </div>

          <Link href="/dashboard" data-testid="link-chat-dashboard">
            <Button variant="outline" className="rounded-full bg-white/50" data-testid="button-chat-dashboard">
              Back to dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.45fr]">
          <Card className="glass rounded-3xl" data-testid="card-chat">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg" data-testid="text-chat-card-title">
                PolicyLens Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                ref={listRef}
                className="h-[420px] space-y-3 overflow-auto rounded-2xl border bg-white/55 p-4"
                data-testid="list-messages"
              >
                {messages.map((m) => (
                  <Bubble key={m.id} role={m.role} text={m.text} />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border bg-white/60" data-testid="img-user">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question\u2026"
                  className="h-11 rounded-2xl bg-white/60"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send();
                  }}
                  data-testid="input-chat"
                />
                <Button onClick={send} className="h-11 rounded-2xl" data-testid="button-chat-send">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl" data-testid="card-suggestions">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg" data-testid="text-suggestions-title">
                Example questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.map((s, idx) => (
                <button
                  key={s}
                  className="w-full rounded-2xl border bg-white/55 p-3 text-left text-sm transition hover:bg-white/65"
                  onClick={() => setInput(s)}
                  data-testid={`button-suggestion-${idx}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    {s}
                  </span>
                </button>
              ))}
              <div className="pt-2 text-xs text-muted-foreground" data-testid="text-suggestions-note">
                Responses are mock (demo-only) — replace with your model later.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
