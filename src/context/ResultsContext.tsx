import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ReactionTimeResult {
  avgMs: number;
  trials: number[];
}

export interface StroopResult {
  accuracy: number;
  avgTimeMs: number;
}

export interface CPTResult {
  hits: number;
  misses: number;
  falseAlarms: number;
  avgRT: number;
  totalStimuli: number;
}

export interface SequenceResult {
  maxLevel: number;
}

export interface TestResults {
  reactionTime: ReactionTimeResult | null;
  stroop: StroopResult | null;
  cpt: CPTResult | null;
  sequence: SequenceResult | null;
}

interface ResultsContextType {
  results: TestResults;
  setReactionTime: (r: ReactionTimeResult) => void;
  setStroop: (r: StroopResult) => void;
  setCPT: (r: CPTResult) => void;
  setSequence: (r: SequenceResult) => void;
  completedCount: number;
  reset: () => void;
}

const defaultResults: TestResults = {
  reactionTime: null,
  stroop: null,
  cpt: null,
  sequence: null,
};

const STORAGE_KEY = "spanx-results-v1";

const loadResults = (): TestResults => {
  if (typeof window === "undefined") return defaultResults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultResults;
    const parsed = JSON.parse(raw);
    return { ...defaultResults, ...parsed };
  } catch {
    return defaultResults;
  }
};

const ResultsContext = createContext<ResultsContextType | null>(null);

export const useResults = () => {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error("useResults must be used within ResultsProvider");
  return ctx;
};

export const ResultsProvider = ({ children }: { children: ReactNode }) => {
  const [results, setResults] = useState<TestResults>(loadResults);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch {
      // ignore quota / private-mode write failures
    }
  }, [results]);

  const completedCount = [results.reactionTime, results.stroop, results.cpt, results.sequence].filter(Boolean).length;

  return (
    <ResultsContext.Provider
      value={{
        results,
        setReactionTime: (r) => setResults((prev) => ({ ...prev, reactionTime: r })),
        setStroop: (r) => setResults((prev) => ({ ...prev, stroop: r })),
        setCPT: (r) => setResults((prev) => ({ ...prev, cpt: r })),
        setSequence: (r) => setResults((prev) => ({ ...prev, sequence: r })),
        completedCount,
        reset: () => setResults(defaultResults),
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
};
