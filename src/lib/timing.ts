// Timing helpers for the reaction-based tests.
//
// Two systematic errors inflate web-measured reaction times, and both are
// addressed here:
//
//  1. Stimulus onset is often timestamped when JavaScript *decides* to show
//     the stimulus, which is one or more frames before the browser actually
//     paints it. `onNextPaint` defers the timestamp until after the paint, so
//     onset reflects (approximately) when the stimulus became visible.
//
//  2. The response is often timestamped with performance.now() inside the
//     event handler, which runs after event dispatch. `eventTime` instead uses
//     the event's own timeStamp, set by the browser when the input occurred.
//
// Onset and response timestamps both live on the same monotonic time origin as
// performance.now(), so subtracting them yields a valid interval. Note this
// removes software-side bias only; per-device display/input latency is a fixed
// offset that cancels out of within-subject comparison and percentile ranking.

/**
 * Reaction times below this (ms) are anticipations — the person responded
 * before they could have processed the stimulus — not genuine reactions.
 * Standard PVT false-start threshold.
 */
export const MIN_VALID_RT = 100;

export const isAnticipation = (rt: number): boolean => rt < MIN_VALID_RT;

/** Keep only physiologically plausible reaction times, for averaging. */
export const validReactionTimes = (rts: number[]): number[] =>
  rts.filter((rt) => rt >= MIN_VALID_RT);

/**
 * Run `cb` with a high-resolution timestamp taken *after* the browser paints
 * the next frame — approximately when a just-rendered stimulus becomes visible.
 * Uses a double requestAnimationFrame: the first callback fires before the
 * paint of the pending frame, the second on the following frame, by which point
 * the stimulus is on screen. Returns a cancel function for unmount cleanup.
 */
export const onNextPaint = (cb: (timestamp: number) => void): (() => void) => {
  if (typeof requestAnimationFrame === "undefined") {
    cb(performance.now());
    return () => {};
  }
  let inner = 0;
  const outer = requestAnimationFrame(() => {
    inner = requestAnimationFrame((ts) => cb(ts));
  });
  return () => {
    cancelAnimationFrame(outer);
    if (inner) cancelAnimationFrame(inner);
  };
};

/** A native DOM event or a React synthetic event — anything carrying a timeStamp. */
export interface TimedEvent {
  timeStamp?: number;
  nativeEvent?: { timeStamp?: number };
}

/**
 * Best available high-resolution timestamp for a user-input event. Trusted
 * events carry a `timeStamp` set when the browser created the event, before
 * dispatch and handler latency. Prefers the native event's value (React
 * synthetic events expose it via `nativeEvent`) and falls back to
 * performance.now() if a browser reports a non-positive or legacy epoch-based
 * value (performance.now() stays well under 1e12 ms; epoch time is ~1.7e12).
 */
export const eventTime = (e: TimedEvent): number => {
  const ts = e?.nativeEvent?.timeStamp ?? e?.timeStamp ?? 0;
  if (ts > 0 && ts < 1e12) return ts;
  return performance.now();
};
