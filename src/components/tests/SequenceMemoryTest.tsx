import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";

type Phase = "idle" | "showing" | "input" | "feedback" | "done";

const GRID_SIZE = 9; // 3x3

const SequenceMemoryTest = ({ onComplete }: { onComplete: (maxLevel: number) => void }) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(3);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [maxLevel, setMaxLevel] = useState(0);
  const showIndexRef = useRef(0);

  const generateSequence = useCallback((len: number) => {
    const seq: number[] = [];
    while (seq.length < len) {
      const n = Math.floor(Math.random() * GRID_SIZE);
      if (seq[seq.length - 1] !== n) seq.push(n);
    }
    return seq;
  }, []);

  const startRound = useCallback((lvl: number) => {
    const seq = generateSequence(lvl);
    setSequence(seq);
    setUserInput([]);
    setCorrect(null);
    setPhase("showing");
    showIndexRef.current = 0;

    // Show sequence one by one
    let i = 0;
    const showNext = () => {
      if (i < seq.length) {
        setActiveCell(seq[i]);
        setTimeout(() => {
          setActiveCell(null);
          i++;
          setTimeout(showNext, 200);
        }, 500);
      } else {
        setPhase("input");
      }
    };
    setTimeout(showNext, 500);
  }, [generateSequence]);

  const start = () => {
    setLevel(3);
    setMaxLevel(0);
    startRound(3);
  };

  const handleCellClick = (index: number) => {
    if (phase !== "input") return;
    const newInput = [...userInput, index];
    setUserInput(newInput);
    setActiveCell(index);
    setTimeout(() => setActiveCell(null), 150);

    if (newInput.length === sequence.length) {
      const isCorrect = newInput.every((v, i) => v === sequence[i]);
      setCorrect(isCorrect);
      setPhase("feedback");

      if (isCorrect) {
        const newLevel = level + 1;
        const newMax = Math.max(maxLevel, level);
        setMaxLevel(newMax);
        setTimeout(() => {
          setLevel(newLevel);
          startRound(newLevel);
        }, 800);
      } else {
        const finalMax = Math.max(maxLevel, level - 1);
        setMaxLevel(finalMax);
        setTimeout(() => {
          setPhase("done");
          onComplete(finalMax);
        }, 800);
      }
    }
  };

  if (phase === "idle") {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Watch the sequence of highlighted squares, then repeat it in the same order. The sequence gets longer each round. 
          This measures your <strong>working memory span</strong> (Corsi Block-Tapping Test).
        </p>
        <Button onClick={start} className="font-display">Start Test</Button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="text-center space-y-6 animate-fade-in">
        <p className="font-display text-lg font-bold">Test Complete</p>
        <div className="stat-card mx-auto max-w-[200px]">
          <span className="stat-value text-3xl">{maxLevel}</span>
          <span className="stat-label">Max Sequence</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Average working memory span is 5–9 items. A higher number indicates stronger attentional capacity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center text-xs text-muted-foreground">
        Level {level} — {phase === "showing" ? "Watch the sequence..." : "Your turn!"}
        {correct !== null && (
          <span className={`ml-2 font-bold ${correct ? "text-success" : "text-destructive"}`}>
            {correct ? "Correct!" : "Wrong!"}
          </span>
        )}
      </div>
      <div className="mx-auto grid grid-cols-3 gap-3 max-w-[280px]">
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleCellClick(i)}
            disabled={phase !== "input"}
            className={`aspect-square rounded-xl border-2 transition-all duration-150 ${
              activeCell === i
                ? "bg-primary border-primary scale-95"
                : "bg-card border-border hover:border-primary/40"
            } ${phase === "input" ? "cursor-pointer active:scale-90" : "cursor-default"}`}
          />
        ))}
      </div>
      <div className="flex justify-center gap-1">
        {sequence.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < userInput.length ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SequenceMemoryTest;
