// Pure scoring helpers for the attention tests.
// Kept free of React so they can be unit-tested in isolation.

export const mean = (nums: number[]): number =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

/** Median is more robust than mean for reaction times, which are right-skewed by occasional lapses. */
export const median = (nums: number[]): number => {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

/**
 * Inverse standard-normal CDF (probit). Acklam's rational approximation,
 * accurate to ~1.15e-9. Needed for signal-detection d-prime.
 */
export const inverseNormalCDF = (p: number): number => {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
};

/**
 * Signal-detection sensitivity d' = z(hitRate) - z(falseAlarmRate).
 * Uses the log-linear correction (Hautus, 1995) so perfect/zero rates don't blow up to +/-Infinity.
 * Higher d' = better discrimination of targets from non-targets.
 */
export const computeDPrime = (
  hits: number,
  targets: number,
  falseAlarms: number,
  nonTargets: number
): number => {
  if (targets <= 0 || nonTargets <= 0) return 0;
  const hitRate = (hits + 0.5) / (targets + 1);
  const faRate = (falseAlarms + 0.5) / (nonTargets + 1);
  return inverseNormalCDF(hitRate) - inverseNormalCDF(faRate);
};

// --- Percentile lookups, estimated from published normative data ---

/** PVT norms (Basner & Dinges, 2011). Lower reaction time -> higher percentile. */
export const getReactionTimePercentile = (avgMs: number): number => {
  if (avgMs <= 160) return 99;
  if (avgMs <= 180) return 95;
  if (avgMs <= 200) return 90;
  if (avgMs <= 220) return 80;
  if (avgMs <= 250) return 65;
  if (avgMs <= 280) return 50;
  if (avgMs <= 320) return 35;
  if (avgMs <= 370) return 20;
  if (avgMs <= 450) return 10;
  return 5;
};

export const getStroopPercentile = (accuracy: number, avgTimeMs: number): number => {
  const accScore = accuracy >= 100 ? 95 : accuracy >= 90 ? 80 : accuracy >= 80 ? 60 : accuracy >= 70 ? 40 : 20;
  const speedScore = avgTimeMs <= 500 ? 95 : avgTimeMs <= 700 ? 80 : avgTimeMs <= 900 ? 60 : avgTimeMs <= 1200 ? 40 : 20;
  return Math.round(accScore * 0.6 + speedScore * 0.4);
};

export const getCPTPercentile = (
  hits: number,
  misses: number,
  falseAlarms: number,
  avgRT: number,
  totalStimuli: number
): number => {
  const targets = hits + misses;
  const nonTargets = Math.max(totalStimuli - targets, 1);
  const hitRate = targets > 0 ? hits / targets : 0;
  const faRate = falseAlarms / nonTargets; // proportion of non-targets wrongly answered
  const accScore = hitRate >= 1 ? 95 : hitRate >= 0.9 ? 80 : hitRate >= 0.8 ? 60 : hitRate >= 0.6 ? 35 : 15;
  const faScore = faRate <= 0.05 ? 95 : faRate <= 0.1 ? 75 : faRate <= 0.2 ? 50 : 25;
  const rtScore = avgRT <= 300 ? 90 : avgRT <= 400 ? 70 : avgRT <= 500 ? 50 : 30;
  return Math.round(accScore * 0.4 + faScore * 0.3 + rtScore * 0.3);
};

/** Corsi norms: forward span averages ~5-6 in healthy adults. */
export const getSequencePercentile = (maxLevel: number): number => {
  if (maxLevel >= 9) return 99;
  if (maxLevel >= 8) return 95;
  if (maxLevel >= 7) return 85;
  if (maxLevel >= 6) return 70;
  if (maxLevel >= 5) return 50;
  if (maxLevel >= 4) return 30;
  if (maxLevel >= 3) return 15;
  return 5;
};

export interface Rating {
  label: string;
  color: string;
  description: string;
}

export const getOverallRating = (score: number): Rating => {
  if (score >= 90) return { label: "Exceptional", color: "text-primary", description: "Your attention abilities are outstanding, placing you among the top performers." };
  if (score >= 75) return { label: "Above Average", color: "text-primary", description: "Your attention skills are stronger than most people. You show solid focus and cognitive control." };
  if (score >= 50) return { label: "Average", color: "text-foreground", description: "Your attention abilities are typical for the general population. Room for improvement exists." };
  if (score >= 30) return { label: "Below Average", color: "text-warning", description: "Your scores suggest some areas of attention could benefit from practice or lifestyle changes." };
  return { label: "Needs Improvement", color: "text-destructive", description: "Your results indicate attention difficulties. Consider factors like sleep, stress, or screen time." };
};
