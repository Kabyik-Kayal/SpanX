import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ResultsProvider, useResults } from "./ResultsContext";

const STORAGE_KEY = "spanx-results-v1";
const wrapper = ({ children }: { children: React.ReactNode }) => <ResultsProvider>{children}</ResultsProvider>;

describe("ResultsContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", () => {
    const { result } = renderHook(() => useResults(), { wrapper });
    expect(result.current.completedCount).toBe(0);
    expect(result.current.results.sequence).toBeNull();
  });

  it("records a result and increments the completed count", () => {
    const { result } = renderHook(() => useResults(), { wrapper });
    act(() => result.current.setSequence({ maxLevel: 6 }));
    expect(result.current.results.sequence).toEqual({ maxLevel: 6 });
    expect(result.current.completedCount).toBe(1);
  });

  it("persists results to localStorage", () => {
    const { result } = renderHook(() => useResults(), { wrapper });
    act(() => result.current.setReactionTime({ avgMs: 250, trials: [240, 260] }));
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored.reactionTime.avgMs).toBe(250);
  });

  it("hydrates from localStorage on mount", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cpt: { hits: 8, misses: 1, falseAlarms: 0, avgRT: 320, totalStimuli: 30 } })
    );
    const { result } = renderHook(() => useResults(), { wrapper });
    expect(result.current.results.cpt?.hits).toBe(8);
    expect(result.current.completedCount).toBe(1);
  });

  it("reset clears all results", () => {
    const { result } = renderHook(() => useResults(), { wrapper });
    act(() => result.current.setStroop({ accuracy: 90, avgTimeMs: 700 }));
    expect(result.current.completedCount).toBe(1);
    act(() => result.current.reset());
    expect(result.current.completedCount).toBe(0);
    expect(result.current.results.stroop).toBeNull();
  });

  it("survives corrupt localStorage without throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not valid json");
    const { result } = renderHook(() => useResults(), { wrapper });
    expect(result.current.completedCount).toBe(0);
  });
});
