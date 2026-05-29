import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { computeDPrime } from "@/lib/scoring";
import { onNextPaint, eventTime, MIN_VALID_RT, type TimedEvent } from "@/lib/timing";

type Phase = "idle" | "testing" | "done";

interface TrialResult {
  letter: string;
  isTarget: boolean;
  responded: boolean;
  reactionTime: number | null;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TARGET_LETTER = "X";
const TRIAL_DURATION = 1000; // ms each letter shown
const TOTAL_STIMULI = 30;
const TARGET_PROBABILITY = 0.3;

interface CPTStats {
  hits: number;
  misses: number;
  falseAlarms: number;
  totalTargets: number;
  avgRT: number;
  dPrime: number;
}

const summarize = (results: TrialResult[]): CPTStats => {
  const hits = results.filter((r) => r.isTarget && r.responded).length;
  const misses = results.filter((r) => r.isTarget && !r.responded).length;
  const falseAlarms = results.filter((r) => !r.isTarget && r.responded).length;
  const totalTargets = hits + misses;
  const nonTargets = results.length - totalTargets;
  const rts = results.filter((r) => r.isTarget && r.responded && r.reactionTime !== null).map((r) => r.reactionTime!);
  const avgRT = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;
  const dPrime = computeDPrime(hits, totalTargets, falseAlarms, nonTargets);
  return { hits, misses, falseAlarms, totalTargets, avgRT, dPrime };
};

const CPTTest = ({ onComplete }: { onComplete: (hits: number, misses: number, falseAlarms: number, avgRT: number, totalStimuli: number) => void }) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentLetter, setCurrentLetter] = useState("");
  const [stimulusIndex, setStimulusIndex] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [showLetter, setShowLetter] = useState(false);
  const respondedRef = useRef(false);
  const startTimeRef = useRef(0);
  const sequenceRef = useRef<string[]>([]);

  const generateSequence = useCallback(() => {
    const seq: string[] = [];
    for (let i = 0; i < TOTAL_STIMULI; i++) {
      if (Math.random() < TARGET_PROBABILITY) {
        seq.push(TARGET_LETTER);
      } else {
        let letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        while (letter === TARGET_LETTER) {
          letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        }
        seq.push(letter);
      }
    }
    return seq;
  }, []);

  const start = () => {
    const seq = generateSequence();
    sequenceRef.current = seq;
    setResults([]);
    setStimulusIndex(0);
    setPhase("testing");
  };

  // Stimulus presentation: show each letter, then record a miss + advance on timeout.
  useEffect(() => {
    if (phase !== "testing" || stimulusIndex >= TOTAL_STIMULI) return;

    respondedRef.current = false;
    const letter = sequenceRef.current[stimulusIndex];
    setCurrentLetter(letter);
    setShowLetter(true);
    // Fallback onset, refined to the paint of this letter when rAF fires.
    startTimeRef.current = performance.now();
    const cancelOnset = onNextPaint((ts) => { startTimeRef.current = ts; });

    const hideTimeout = setTimeout(() => setShowLetter(false), 600);

    const nextTimeout = setTimeout(() => {
      if (!respondedRef.current) {
        setResults((prev) => [...prev, {
          letter,
          isTarget: letter === TARGET_LETTER,
          responded: false,
          reactionTime: null,
        }]);
      }
      setStimulusIndex((prev) => prev + 1);
    }, TRIAL_DURATION);

    return () => {
      cancelOnset();
      clearTimeout(hideTimeout);
      clearTimeout(nextTimeout);
    };
  }, [phase, stimulusIndex]);

  // Completion: fire once every stimulus has produced a result.
  useEffect(() => {
    if (phase === "testing" && results.length >= TOTAL_STIMULI) {
      setPhase("done");
      const { hits, misses, falseAlarms, avgRT } = summarize(results);
      onComplete(hits, misses, falseAlarms, avgRT, TOTAL_STIMULI);
    }
  }, [phase, results, onComplete]);

  const handleResponse = useCallback((e?: TimedEvent) => {
    if (phase !== "testing" || respondedRef.current) return;
    respondedRef.current = true;
    const rt = e ? Math.round(eventTime(e) - startTimeRef.current) : null;
    // Keep the response (it still counts as a hit/false alarm), but only record
    // a reaction time that's a plausible reaction — anticipations are excluded.
    const validRT = rt !== null && rt >= MIN_VALID_RT ? rt : null;
    const letter = sequenceRef.current[stimulusIndex];
    setResults((prev) => [...prev, {
      letter,
      isTarget: letter === TARGET_LETTER,
      responded: true,
      reactionTime: validRT,
    }]);
  }, [phase, stimulusIndex]);

  useEffect(() => {
    if (phase !== "testing") return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleResponse(e);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, handleResponse]);

  if (phase === "idle") {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Letters will flash on screen one at a time. Press <strong>Space</strong> or <strong>tap the screen</strong> only when you see the letter <strong className="text-primary">X</strong>.
          This is a Continuous Performance Test (CPT) measuring sustained attention.
        </p>
        <Button onClick={start} className="font-display">Start Test</Button>
      </div>
    );
  }

  if (phase === "done") {
    const { hits, misses, falseAlarms, totalTargets, avgRT, dPrime } = summarize(results);

    return (
      <div className="text-center space-y-6 animate-fade-in">
        <p className="font-display text-lg font-bold">Test Complete</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="stat-card">
            <span className="stat-value">{hits}/{totalTargets}</span>
            <span className="stat-label">Hits</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{misses}</span>
            <span className="stat-label">Misses</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{falseAlarms}</span>
            <span className="stat-label">False Alarms</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{avgRT}ms</span>
            <span className="stat-label">Avg RT</span>
          </div>
        </div>
        <div className="stat-card mx-auto max-w-[220px]">
          <span className="stat-value">{dPrime.toFixed(2)}</span>
          <span className="stat-label">Sensitivity (d')</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          d' combines hits and false alarms into one sensitivity score — higher means you told targets apart from distractors more reliably. Fewer misses and false alarms indicate better sustained attention.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center text-xs text-muted-foreground">
        {stimulusIndex + 1} / {TOTAL_STIMULI} — Tap or press Space when you see <strong className="text-primary">X</strong>
      </div>
      <div
        className={`test-zone h-52 md:h-64 w-full cursor-pointer ${showLetter ? "test-zone-active" : ""}`}
        onClick={handleResponse}
      >
        {showLetter && (
          <span className={`font-display text-6xl md:text-8xl font-bold select-none transition-opacity ${
            currentLetter === TARGET_LETTER ? "text-primary" : "text-foreground"
          }`}>
            {currentLetter}
          </span>
        )}
      </div>
      <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((stimulusIndex + 1) / TOTAL_STIMULI) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default CPTTest;
