import { useNavigate } from "react-router-dom";
import { useResults } from "@/context/ResultsContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, RotateCcw, Trophy } from "lucide-react";

// Percentile lookup tables based on published norms
const getReactionTimePercentile = (avgMs: number): number => {
  // Based on PVT norms (Basner & Dinges, 2011)
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

const getStroopPercentile = (accuracy: number, avgTimeMs: number): number => {
  // Combined score: accuracy weighted more heavily
  const accScore = accuracy >= 100 ? 95 : accuracy >= 90 ? 80 : accuracy >= 80 ? 60 : accuracy >= 70 ? 40 : 20;
  const speedScore = avgTimeMs <= 500 ? 95 : avgTimeMs <= 700 ? 80 : avgTimeMs <= 900 ? 60 : avgTimeMs <= 1200 ? 40 : 20;
  return Math.round(accScore * 0.6 + speedScore * 0.4);
};

const getCPTPercentile = (hits: number, misses: number, falseAlarms: number, avgRT: number): number => {
  const total = hits + misses;
  const hitRate = total > 0 ? hits / total : 0;
  const faRate = falseAlarms / 30; // out of total stimuli
  const dPrime = Math.min(hitRate * 100 - faRate * 100, 100);
  const accScore = hitRate >= 1 ? 95 : hitRate >= 0.9 ? 80 : hitRate >= 0.8 ? 60 : hitRate >= 0.6 ? 35 : 15;
  const faScore = faRate <= 0.05 ? 95 : faRate <= 0.1 ? 75 : faRate <= 0.2 ? 50 : 25;
  const rtScore = avgRT <= 300 ? 90 : avgRT <= 400 ? 70 : avgRT <= 500 ? 50 : 30;
  return Math.round(accScore * 0.4 + faScore * 0.3 + rtScore * 0.3);
};

const getSequencePercentile = (maxLevel: number): number => {
  // Corsi norms: average span is 5-6
  if (maxLevel >= 9) return 99;
  if (maxLevel >= 8) return 95;
  if (maxLevel >= 7) return 85;
  if (maxLevel >= 6) return 70;
  if (maxLevel >= 5) return 50;
  if (maxLevel >= 4) return 30;
  if (maxLevel >= 3) return 15;
  return 5;
};

const getOverallRating = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: "Exceptional", color: "text-primary" };
  if (score >= 75) return { label: "Above Average", color: "text-primary" };
  if (score >= 50) return { label: "Average", color: "text-foreground" };
  if (score >= 30) return { label: "Below Average", color: "text-warning" };
  return { label: "Needs Improvement", color: "text-destructive" };
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { results, completedCount, reset } = useResults();

  const percentiles: { name: string; percentile: number | null; path: string }[] = [
    {
      name: "Reaction Time",
      percentile: results.reactionTime ? getReactionTimePercentile(results.reactionTime.avgMs) : null,
      path: "/test/reaction-time",
    },
    {
      name: "Stroop Test",
      percentile: results.stroop ? getStroopPercentile(results.stroop.accuracy, results.stroop.avgTimeMs) : null,
      path: "/test/stroop",
    },
    {
      name: "Sustained Attention",
      percentile: results.cpt ? getCPTPercentile(results.cpt.hits, results.cpt.misses, results.cpt.falseAlarms, results.cpt.avgRT) : null,
      path: "/test/cpt",
    },
    {
      name: "Sequence Memory",
      percentile: results.sequence ? getSequencePercentile(results.sequence.maxLevel) : null,
      path: "/test/sequence",
    },
  ];

  const completedPercentiles = percentiles.filter((p) => p.percentile !== null).map((p) => p.percentile!);
  const overallScore = completedPercentiles.length > 0
    ? Math.round(completedPercentiles.reduce((a, b) => a + b, 0) / completedPercentiles.length)
    : null;

  const rating = overallScore !== null ? getOverallRating(overallScore) : null;

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tests
        </button>

        <div className="mb-10">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Your Results</h1>
          <p className="text-sm text-muted-foreground">
            {completedCount}/4 tests completed
            {completedCount < 4 && " — complete all tests for your full attention profile."}
          </p>
        </div>

        {/* Overall Score */}
        {overallScore !== null && (
          <div className="mb-8 rounded-2xl border-2 border-border bg-card p-6 md:p-8 text-center animate-fade-in">
            <div className="mb-2 flex justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Overall Attention Score
            </p>
            <div className="relative mx-auto mb-4 h-32 w-32">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${overallScore * 2.64} 264`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-bold">{overallScore}</span>
                <span className="text-xs text-muted-foreground">percentile</span>
              </div>
            </div>
            <p className={`font-display text-sm font-bold ${rating?.color}`}>
              {rating?.label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              You scored higher than {overallScore}% of people
            </p>
          </div>
        )}

        {/* Individual Tests */}
        <div className="grid gap-3">
          {percentiles.map((test) => (
            <div
              key={test.name}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 md:p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                {test.percentile !== null ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-border" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold">{test.name}</p>
                {test.percentile !== null ? (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${test.percentile}%` }}
                      />
                    </div>
                    <span className="font-display text-sm font-bold text-primary shrink-0 w-12 text-right">
                      {test.percentile}%
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(test.path)}
                    className="mt-1 text-xs text-primary hover:underline font-display"
                  >
                    Take this test →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        {completedCount > 0 && (
          <div className="mt-8 rounded-2xl border-2 border-border bg-card p-5 md:p-6 space-y-4 animate-fade-in">
            <h2 className="font-display text-sm font-bold">Detailed Breakdown</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {results.reactionTime && (
                <div className="stat-card">
                  <span className="stat-value text-lg">{results.reactionTime.avgMs}ms</span>
                  <span className="stat-label">Reaction</span>
                </div>
              )}
              {results.stroop && (
                <>
                  <div className="stat-card">
                    <span className="stat-value text-lg">{results.stroop.accuracy}%</span>
                    <span className="stat-label">Stroop Acc.</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value text-lg">{results.stroop.avgTimeMs}ms</span>
                    <span className="stat-label">Stroop Speed</span>
                  </div>
                </>
              )}
              {results.cpt && (
                <>
                  <div className="stat-card">
                    <span className="stat-value text-lg">{results.cpt.hits}/{results.cpt.hits + results.cpt.misses}</span>
                    <span className="stat-label">CPT Hits</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value text-lg">{results.cpt.falseAlarms}</span>
                    <span className="stat-label">False Alarms</span>
                  </div>
                </>
              )}
              {results.sequence && (
                <div className="stat-card">
                  <span className="stat-value text-lg">{results.sequence.maxLevel}</span>
                  <span className="stat-label">Max Span</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-3">
          {completedCount < 4 && (
            <Button onClick={() => {
              const incomplete = percentiles.find(p => p.percentile === null);
              if (incomplete) navigate(incomplete.path);
            }}>
              Continue Testing
            </Button>
          )}
          {completedCount > 0 && (
            <Button variant="outline" onClick={() => { reset(); navigate("/"); }} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All
            </Button>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/60 max-w-sm mx-auto">
          Percentile rankings are estimated from published normative data. Individual results may vary based on device, environment, and testing conditions.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
