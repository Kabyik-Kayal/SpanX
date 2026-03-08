import { useNavigate } from "react-router-dom";
import { Zap, Brain, Eye, Grid3X3, BarChart3 } from "lucide-react";
import { useResults } from "@/context/ResultsContext";

const tests = [
  {
    id: "reaction-time",
    title: "Reaction Time",
    description: "How fast can you respond to a visual stimulus?",
    icon: Zap,
    method: "Psychomotor Vigilance Task (PVT)",
    duration: "~1 min",
    path: "/test/reaction-time",
  },
  {
    id: "stroop",
    title: "Stroop Test",
    description: "Can you ignore conflicting information?",
    icon: Eye,
    method: "Stroop Color-Word Interference",
    duration: "~2 min",
    path: "/test/stroop",
  },
  {
    id: "cpt",
    title: "Sustained Attention",
    description: "Can you stay focused over repeated stimuli?",
    icon: Brain,
    method: "Continuous Performance Test (CPT)",
    duration: "~1 min",
    path: "/test/cpt",
  },
  {
    id: "sequence",
    title: "Sequence Memory",
    description: "How many items can your working memory hold?",
    icon: Grid3X3,
    method: "Corsi Block-Tapping Test",
    duration: "~2 min",
    path: "/test/sequence",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { completedCount } = useResults();

  return (
    <div className="min-h-screen bg-background px-4 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-12 md:mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-gentle" />
            <span className="font-display text-xs tracking-wider text-muted-foreground uppercase">
              Science-backed
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl leading-tight">
            Measure your
            <br />
            <span className="text-primary">attention span</span>
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed font-body">
            Four clinically-validated cognitive tests measuring different dimensions of attention. Takes about 6 minutes. No sign-up required.
          </p>
        </div>

        {/* Test Overview (non-interactive) */}
        <div className="grid gap-3">
          {tests.map((test, i) => (
            <div
              key={test.id}
              className="flex items-start gap-4 rounded-2xl border-2 border-border bg-card p-5 text-left opacity-80"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <test.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-sm font-bold">{test.title}</h2>
                  <span className="shrink-0 text-xs text-muted-foreground font-display">{test.duration}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground font-body">{test.description}</p>
                <p className="mt-1.5 text-xs text-muted-foreground/70 font-display">{test.method}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Take Test CTA */}
        <button
          onClick={() => navigate("/test")}
          className="mt-6 w-full rounded-2xl border-2 border-primary bg-primary text-primary-foreground p-4 font-display text-sm font-bold transition-all hover:bg-primary/90 active:scale-[0.99]"
        >
          Take Test →
        </button>

        {/* Dashboard CTA */}
        {completedCount > 0 && (
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-3 w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 font-display text-sm font-bold text-primary transition-all hover:bg-primary/10 active:scale-[0.99]"
          >
            <BarChart3 className="h-5 w-5" />
            View Dashboard — {completedCount}/4 tests completed
          </button>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-sm mx-auto font-body">
            These tests are based on established cognitive psychology paradigms. Results are for educational purposes and do not constitute a clinical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
