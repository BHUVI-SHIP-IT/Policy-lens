import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send, ShieldCheck, User, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSubmitInsight, normalizeQuestion, detectConfusion, categorizeQuestion } from "@/hooks/use-user-insights";
import { useAnalysisSession } from "@/hooks/use-session";
import { useAIChatQuestion } from "@/hooks/use-ai-analysis";

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
          "max-w-[86%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed shadow-md " +
          (isUser
            ? "bg-gradient-to-br from-primary to-blue-600 text-white border-2 border-primary/20 shadow-primary/20"
            : "bg-white text-foreground border-2 border-gray-200 shadow-gray-200/50")
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
  const [policyContext] = useState(() => {
    // Load from localStorage or use demo text
    const stored = localStorage.getItem('currentPolicyText');
    return stored || `HDFC ERGO Health Insurance: Covers hospitalization after 36-month waiting for pre-existing conditions. Room rent capped at 1% of sum insured. 48-hour claim intimation required.`;
  });
  const listRef = useRef<HTMLDivElement | null>(null);
  const { mutate: submitInsight } = useSubmitInsight();
  const { session, updateActivity } = useAnalysisSession();
  const { mutate: askAI, isPending: isAIThinking } = useAIChatQuestion();

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

    // Track question anonymously
    submitInsight({
      normalizedQuestion: normalizeQuestion(trimmed),
      category: categorizeQuestion(trimmed),
      isConfused: detectConfusion(trimmed) ? 1 : 0,
    });

    setMessages((m) => [...m, userMsg]);
    setInput("");

    // AI-powered chat using Gemini
    askAI({ policyText: policyContext, question: trimmed }, {
      onSuccess: (aiResponse) => {
        const botMsg: Msg = { 
          id: `b-${Date.now()}`, 
          role: "bot", 
          text: aiResponse.answer + (aiResponse.disclaimer ? `\n\n⚠️ ${aiResponse.disclaimer}` : "")
        };
        setMessages((m) => [...m, botMsg]);
        
        setTimeout(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
        }, 50);
      },
      onError: () => {
        const errorMsg: Msg = {
          id: `b-${Date.now()}`,
          role: "bot",
          text: "Sorry, I'm having trouble right now. Please try again."
        };
        setMessages((m) => [...m, errorMsg]);
      }
    });

    // Update session activity
    if (session) {
      updateActivity(
        session.policiesAnalyzed || 0,
        (session.questionsAsked || 0) + 1
      );
    }

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
              className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20"
              data-testid="img-chat-brand"
            >
              <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" data-testid="text-chat-title">
                AI Assistant
              </div>
              <div className="text-sm font-medium text-muted-foreground" data-testid="text-chat-subtitle">
                Ask questions about your policy
              </div>
            </div>
          </div>

          <Link href="/dashboard" data-testid="link-chat-dashboard">
            <Button variant="outline" className="rounded-full bg-white/50" data-testid="button-chat-dashboard">
              Back to dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.45fr]">
          <Card className="glass rounded-3xl border-2 border-white/60 shadow-xl" data-testid="card-chat">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2" data-testid="text-chat-card-title">
                <Bot className="h-6 w-6 text-primary" />
                PolicyLens AI Chat
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

          <Card className="glass rounded-3xl border-2 border-white/60 shadow-xl" data-testid="card-suggestions">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2" data-testid="text-suggestions-title">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Quick Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((s, idx) => (
                <button
                  key={s}
                  className="w-full rounded-2xl border-2 border-white/80 bg-gradient-to-br from-white to-blue-50/30 p-4 text-left text-sm font-medium transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/30"
                  onClick={() => setInput(s)}
                  data-testid={`button-suggestion-${idx}`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Bot className="h-4.5 w-4.5 text-primary" />
                    {s}
                  </span>
                </button>
              ))}
              <div className="pt-2 text-sm font-medium text-primary/70" data-testid="text-suggestions-note">
                {policyContext.length > 200 ? "✨ AI analyzing your uploaded policy document" : "📄 Using demo policy for questions"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
