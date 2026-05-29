import { describe, it, expect } from "vitest";
import {
  mean,
  median,
  inverseNormalCDF,
  computeDPrime,
  getReactionTimePercentile,
  getStroopPercentile,
  getCPTPercentile,
  getSequencePercentile,
  getOverallRating,
} from "./scoring";

describe("mean", () => {
  it("averages values", () => {
    expect(mean([2, 4, 6])).toBe(4);
  });
  it("returns 0 for an empty array", () => {
    expect(mean([])).toBe(0);
  });
});

describe("median", () => {
  it("returns the middle of an odd-length set", () => {
    expect(median([3, 1, 2])).toBe(2);
  });
  it("averages the two middle values of an even-length set", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
  it("is robust to a single large outlier (unlike mean)", () => {
    const trials = [200, 210, 205, 215, 2000];
    expect(median(trials)).toBe(210);
    expect(mean(trials)).toBeGreaterThan(median(trials));
  });
  it("returns 0 for an empty array", () => {
    expect(median([])).toBe(0);
  });
});

describe("inverseNormalCDF (probit)", () => {
  it("maps 0.5 to ~0", () => {
    expect(inverseNormalCDF(0.5)).toBeCloseTo(0, 6);
  });
  it("maps 0.975 to ~1.96", () => {
    expect(inverseNormalCDF(0.975)).toBeCloseTo(1.95996, 3);
  });
  it("is symmetric about 0.5", () => {
    expect(inverseNormalCDF(0.025)).toBeCloseTo(-1.95996, 3);
  });
});

describe("computeDPrime", () => {
  it("is ~0 at chance performance", () => {
    // half the targets hit, half the non-targets false-alarmed
    expect(computeDPrime(5, 10, 10, 20)).toBeCloseTo(0, 2);
  });
  it("is high for perfect discrimination", () => {
    expect(computeDPrime(10, 10, 0, 20)).toBeGreaterThan(3);
  });
  it("rises as hits increase for a fixed false-alarm rate", () => {
    const low = computeDPrime(6, 10, 1, 20);
    const high = computeDPrime(9, 10, 1, 20);
    expect(high).toBeGreaterThan(low);
  });
  it("returns 0 when there are no targets or non-targets", () => {
    expect(computeDPrime(0, 0, 0, 20)).toBe(0);
    expect(computeDPrime(5, 10, 0, 0)).toBe(0);
  });
});

describe("getReactionTimePercentile", () => {
  it("ranks faster times higher", () => {
    expect(getReactionTimePercentile(150)).toBe(99);
    expect(getReactionTimePercentile(280)).toBe(50);
    expect(getReactionTimePercentile(1000)).toBe(5);
  });
  it("is monotonically non-increasing as time grows", () => {
    const times = [150, 200, 280, 370, 600];
    const percentiles = times.map(getReactionTimePercentile);
    for (let i = 1; i < percentiles.length; i++) {
      expect(percentiles[i]).toBeLessThanOrEqual(percentiles[i - 1]);
    }
  });
});

describe("getStroopPercentile", () => {
  it("rewards high accuracy and speed", () => {
    expect(getStroopPercentile(100, 450)).toBeGreaterThan(getStroopPercentile(70, 1300));
  });
});

describe("getCPTPercentile", () => {
  it("scores a flawless run highly", () => {
    // 9 targets all hit, no false alarms, fast RT, 30 stimuli total
    expect(getCPTPercentile(9, 0, 0, 300, 30)).toBeGreaterThan(85);
  });
  it("penalises misses and false alarms", () => {
    const good = getCPTPercentile(9, 0, 0, 300, 30);
    const poor = getCPTPercentile(3, 6, 8, 600, 30);
    expect(poor).toBeLessThan(good);
  });
});

describe("getSequencePercentile", () => {
  it("maps spans to percentiles", () => {
    expect(getSequencePercentile(9)).toBe(99);
    expect(getSequencePercentile(5)).toBe(50);
    expect(getSequencePercentile(2)).toBe(5);
  });
});

describe("getOverallRating", () => {
  it("labels each band", () => {
    expect(getOverallRating(95).label).toBe("Exceptional");
    expect(getOverallRating(80).label).toBe("Above Average");
    expect(getOverallRating(60).label).toBe("Average");
    expect(getOverallRating(40).label).toBe("Below Average");
    expect(getOverallRating(10).label).toBe("Needs Improvement");
  });
});
