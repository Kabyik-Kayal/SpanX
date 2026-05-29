import { useState, useCallback, useRef, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { onNextPaint, eventTime, validReactionTimes } from "@/lib/timing";
import { mean } from "@/lib/scoring";

const COLORS = [
  { name: "Red", hsl: "0 72% 51%" },
  { name: "Blue", hsl: "217 91% 60%" },
  { name: "Green", hsl: "142 71% 45%" },
  { name: "Yellow", hsl: "45 93% 47%" },
];

interface Trial {
  correct: boolean;
  reactionTime: number;
  congruent: boolean;
}

/** Mean reaction time over plausible trials, ignoring anticipations/misfires. */
const avgValidRT = (trials: Trial[]): number => {
  const rts = validReactionTimes(trials.map((t) => t.reactionTime));
  return rts.length ? Math.round(mean(rts)) : 0;
};

type Phase = "idle" | "testing" | "done";

const StroopTest = ({ onComplete }: { onComplete: (accuracy: number, avgTime: number) => void }) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [options, setOptions] = useState<typeof COLORS>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const startTimeRef = useRef(0);
  const totalTrials = 10;

  const generateTrial = useCallback(() => {
    const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const displayColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setCurrentWord(wordColor.name);
    setCurrentColor(displayColor);

    // Shuffle options to include the correct answer
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    // Fallback onset, refined to the paint of the new word when rAF fires.
    startTimeRef.current = performance.now();
    onNextPaint((ts) => { startTimeRef.current = ts; });
    setFeedback(null);
  }, []);

  const start = () => {
    setPhase("testing");
    setTrials([]);
    generateTrial();
  };

  const handleAnswer = (selectedColor: typeof COLORS[0], e: MouseEvent<HTMLButtonElement>) => {
    const rt = Math.round(eventTime(e) - startTimeRef.current);
    const correct = selectedColor.name === currentColor.name;
    const congruent = currentWord === currentColor.name;
    const newTrials = [...trials, { correct, reactionTime: rt, congruent }];
    setTrials(newTrials);

    setFeedback(correct ? "✓" : "✗");

    setTimeout(() => {
      if (newTrials.length >= totalTrials) {
        setPhase("done");
        const accuracy = Math.round((newTrials.filter(t => t.correct).length / newTrials.length) * 100);
        onComplete(accuracy, avgValidRT(newTrials));
      } else {
        generateTrial();
      }
    }, 400);
  };

  if (phase === "idle") {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Words will appear in different colors. Select the <strong>color the word is displayed in</strong>, not what the word says. This tests your selective attention (Stroop Effect).
        </p>
        <Button onClick={start} className="font-display">Start Test</Button>
      </div>
    );
  }

  if (phase === "done") {
    const accuracy = Math.round((trials.filter(t => t.correct).length / trials.length) * 100);
    const avgTime = avgValidRT(trials);
    const avgCongruent = avgValidRT(trials.filter(t => t.congruent));
    const avgIncongruent = avgValidRT(trials.filter(t => !t.congruent));

    return (
      <div className="text-center space-y-6 animate-fade-in">
        <p className="font-display text-lg font-bold">Test Complete</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="stat-card">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{avgTime}ms</span>
            <span className="stat-label">Avg Time</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{avgCongruent}ms</span>
            <span className="stat-label">Congruent</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{avgIncongruent}ms</span>
            <span className="stat-label">Incongruent</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">The Stroop effect: incongruent trials are typically slower, showing the interference of automatic word reading on color naming.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center text-xs text-muted-foreground">
        Trial {trials.length + 1} of {totalTrials}
      </div>
      <div className="test-zone test-zone-active h-40 md:h-48 w-full relative">
        <span
          className="font-display text-4xl md:text-5xl font-bold select-none"
          style={{ color: `hsl(${currentColor.hsl})` }}
        >
          {currentWord}
        </span>
        {feedback && (
          <span className={`absolute top-3 right-4 text-xl font-bold ${feedback === "✓" ? "text-success" : "text-destructive"}`}>
            {feedback}
          </span>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">What color is the word displayed in?</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((color) => (
          <button
            key={color.name}
            onClick={(e) => handleAnswer(color, e)}
            className="rounded-xl border-2 border-border bg-card p-4 font-display text-sm font-medium transition-all hover:border-primary hover:bg-primary/5 active:scale-95"
          >
            <span
              className="inline-block h-4 w-4 rounded-full mr-2 align-middle"
              style={{ backgroundColor: `hsl(${color.hsl})` }}
            />
            {color.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StroopTest;
