import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Eye, Brain, Grid3X3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResults } from "@/context/ResultsContext";
import ReactionTimeTest from "@/components/tests/ReactionTimeTest";
import StroopTest from "@/components/tests/StroopTest";
import CPTTest from "@/components/tests/CPTTest";
import SequenceMemoryTest from "@/components/tests/SequenceMemoryTest";

const TESTS = [
  { id: "reaction-time", title: "Reaction Time", icon: Zap, description: "Psychomotor Vigilance Task" },
  { id: "stroop", title: "Stroop Test", icon: Eye, description: "Color-Word Interference" },
  { id: "cpt", title: "Sustained Attention", icon: Brain, description: "Continuous Performance Test" },
  { id: "sequence", title: "Sequence Memory", icon: Grid3X3, description: "Corsi Block-Tapping" },
];

const ContinuousTestPage = () => {
  const navigate = useNavigate();
  const { setReactionTime, setStroop, setCPT, setSequence } = useResults();
  const [currentTest, setCurrentTest] = useState(0);
  const [testDone, setTestDone] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const handleNext = () => {
    if (currentTest < TESTS.length - 1) {
      setCurrentTest((prev) => prev + 1);
      setTestDone(false);
    } else {
      setAllDone(true);
    }
  };

  const renderTest = () => {
    switch (currentTest) {
      case 0:
        return (
          <ReactionTimeTest
            onComplete={(avg, trials) => {
              setReactionTime({ avgMs: avg, trials });
              setTestDone(true);
            }}
          />
        );
      case 1:
        return (
          <StroopTest
            onComplete={(accuracy, avgTime) => {
              setStroop({ accuracy, avgTimeMs: avgTime });
              setTestDone(true);
            }}
          />
        );
      case 2:
        return (
          <CPTTest
            onComplete={(hits, misses, falseAlarms, avgRT) => {
              setCPT({ hits, misses, falseAlarms, avgRT });
              setTestDone(true);
            }}
          />
        );
      case 3:
        return (
          <SequenceMemoryTest
            onComplete={(maxLevel) => {
              setSequence({ maxLevel });
              setTestDone(true);
            }}
          />
        );
      default:
        return null;
    }
  };

  if (allDone) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl text-center space-y-6 animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-gentle" />
            <span className="font-display text-xs tracking-wider text-muted-foreground uppercase">
              All tests complete
            </span>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">
            Great job! 🎉
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You've completed all four attention tests. View your results to see how you compare.
          </p>
          <Button onClick={() => navigate("/dashboard")} size="lg" className="font-display">
            View Your Results
          </Button>
        </div>
      </div>
    );
  }

  const test = TESTS[currentTest];
  const Icon = test.icon;

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        {/* Progress */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2">
            {TESTS.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                    i < currentTest
                      ? "bg-primary"
                      : i === currentTest
                      ? "bg-primary/50"
                      : "bg-secondary"
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-display">
            Test {currentTest + 1} of {TESTS.length}
          </p>
        </div>

        {/* Test Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold md:text-2xl">{test.title}</h1>
            <p className="text-xs text-muted-foreground font-display">{test.description}</p>
          </div>
        </div>

        {/* Test Content */}
        <div key={currentTest} className="animate-fade-in">
          {renderTest()}
        </div>

        {/* Next Button */}
        {testDone && (
          <div className="mt-8 flex justify-center animate-fade-in">
            <Button onClick={handleNext} size="lg" className="gap-2 font-display">
              {currentTest < TESTS.length - 1 ? (
                <>
                  Next: {TESTS[currentTest + 1].title}
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                "View Results"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContinuousTestPage;
