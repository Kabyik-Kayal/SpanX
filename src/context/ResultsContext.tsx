import { createContext, useContext, useState, ReactNode } from "react";

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

const ResultsContext = createContext<ResultsContextType | null>(null);

export const useResults = () => {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error("useResults must be used within ResultsProvider");
  return ctx;
};

export const ResultsProvider = ({ children }: { children: ReactNode }) => {
  const [results, setResults] = useState<TestResults>(defaultResults);

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
