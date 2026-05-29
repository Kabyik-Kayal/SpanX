import { useState, useRef, useCallback, useLayoutEffect, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { onNextPaint, eventTime, MIN_VALID_RT } from "@/lib/timing";

type Phase = "idle" | "waiting" | "ready" | "result" | "too-early" | "done";

interface Trial {
  reactionTime: number;
}

const ReactionTimeTest = ({ onComplete }: { onComplete: (avg: number, trials: number[]) => void }) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);
  const totalTrials = 5;

  const startTrial = useCallback(() => {
    setPhase("waiting");
    const delay = 2000 + Math.random() * 4000;
    timerRef.current = setTimeout(() => {
      // Fallback onset; refined to the actual paint time by the effect below.
      startTimeRef.current = performance.now();
      setPhase("ready");
    }, delay);
  }, []);

  // Refine the stimulus onset to the paint that makes the green visible, rather
  // than when we flipped state. useLayoutEffect schedules the rAF before paint;
  // if rAF is paused (e.g. backgrounded tab) the fallback above still stands.
  useLayoutEffect(() => {
    if (phase !== "ready") return;
    return onNextPaint((ts) => { startTimeRef.current = ts; });
  }, [phase]);

  const handleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (phase === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("too-early");
      return;
    }
    if (phase === "ready") {
      const rt = Math.round(eventTime(e) - startTimeRef.current);
      if (rt < MIN_VALID_RT) {
        // Faster than a real reaction => anticipation, don't count it.
        setPhase("too-early");
        return;
      }
      setCurrentTime(rt);
      const newTrials = [...trials, { reactionTime: rt }];
      setTrials(newTrials);
      if (newTrials.length >= totalTrials) {
        setPhase("done");
        const times = newTrials.map(t => t.reactionTime);
        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        onComplete(avg, times);
      } else {
        setPhase("result");
      }
    }
  }, [phase, trials, onComplete]);

  const getZoneContent = () => {
    switch (phase) {
      case "idle":
        return (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">Click the button below to begin. A green screen will appear — tap as fast as you can when it does.</p>
            <Button onClick={startTrial} className="font-display">Start Test</Button>
          </div>
        );
      case "waiting":
        return (
          <div
            className="test-zone h-64 md:h-80 w-full cursor-pointer bg-destructive/10 border-destructive/30"
            onClick={handleClick}
          >
            <p className="font-display text-lg text-destructive">Wait for green...</p>
          </div>
        );
      case "ready":
        return (
          <div
            className="test-zone h-64 md:h-80 w-full cursor-pointer bg-success/20 border-success/50"
            onClick={handleClick}
          >
            <p className="font-display text-2xl font-bold text-success">TAP NOW!</p>
          </div>
        );
      case "too-early":
        return (
          <div className="text-center space-y-4">
            <p className="font-display text-destructive font-bold">Too early!</p>
            <p className="text-sm text-muted-foreground">Wait for the green screen before tapping.</p>
            <Button variant="outline" onClick={startTrial}>Try Again</Button>
          </div>
        );
      case "result":
        return (
          <div className="text-center space-y-4">
            <p className="stat-value">{currentTime}ms</p>
            <p className="text-sm text-muted-foreground">Trial {trials.length} of {totalTrials}</p>
            <Button variant="outline" onClick={startTrial}>Next Trial</Button>
          </div>
        );
      case "done":
        return (
          <div className="text-center space-y-3">
            <p className="font-display text-lg font-bold">Test Complete</p>
            <div className="flex flex-wrap justify-center gap-3">
              {trials.map((t, i) => (
                <div key={i} className="stat-card min-w-[70px]">
                  <span className="stat-value text-lg">{t.reactionTime}ms</span>
                  <span className="stat-label">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return <div className="animate-fade-in">{getZoneContent()}</div>;
};

export default ReactionTimeTest;
