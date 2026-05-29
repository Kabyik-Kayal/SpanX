import { describe, it, expect, vi } from "vitest";
import {
  eventTime,
  isAnticipation,
  validReactionTimes,
  onNextPaint,
  MIN_VALID_RT,
} from "./timing";

describe("eventTime", () => {
  it("prefers the native event timestamp", () => {
    expect(eventTime({ timeStamp: 500, nativeEvent: { timeStamp: 123 } })).toBe(123);
  });

  it("falls back to the synthetic timeStamp when there is no nativeEvent", () => {
    expect(eventTime({ timeStamp: 456 })).toBe(456);
  });

  it("falls back to performance.now() for a non-positive timestamp", () => {
    expect(eventTime({ timeStamp: 0 })).toBeGreaterThan(0);
  });

  it("rejects a legacy epoch-based timestamp and falls back", () => {
    const epoch = Date.now(); // ~1.7e12, far above any performance.now() value
    expect(eventTime({ timeStamp: epoch })).toBeLessThan(1e12);
  });
});

describe("anticipation handling", () => {
  it("flags sub-100ms responses as anticipations", () => {
    expect(isAnticipation(80)).toBe(true);
    expect(isAnticipation(120)).toBe(false);
    expect(isAnticipation(MIN_VALID_RT)).toBe(false);
  });

  it("drops anticipations when filtering", () => {
    expect(validReactionTimes([50, 100, 250, 99])).toEqual([100, 250]);
  });
});

describe("onNextPaint", () => {
  it("invokes the callback with the second frame's timestamp", () => {
    const calls: number[] = [];
    let frame = 0;
    const raf = vi.fn((cb: FrameRequestCallback) => {
      cb(++frame * 16);
      return frame;
    });
    vi.stubGlobal("requestAnimationFrame", raf);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    onNextPaint((ts) => calls.push(ts));

    expect(raf).toHaveBeenCalledTimes(2);
    expect(calls).toEqual([32]); // first frame schedules the second; second reports

    vi.unstubAllGlobals();
  });
});
