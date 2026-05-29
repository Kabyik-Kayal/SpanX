import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useResults } from "@/context/ResultsContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, RotateCcw, Trophy } from "lucide-react";
import ShareResults from "@/components/ShareResults";
import {
  median,
  getReactionTimePercentile,
  getStroopPercentile,
  getCPTPercentile,
  getSequencePercentile,
  getOverallRating,
} from "@/lib/scoring";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { results, completedCount, reset } = useResults();
  const screenshotRef = useRef<HTMLDivElement>(null);

  const percentiles: { name: string; percentile: number | null; path: string; what: string; detail: string }[] = [
    {
      name: "Reaction Time",
      percentile: results.reactionTime ? getReactionTimePercentile(median(results.reactionTime.trials)) : null,
      path: "/test/reaction-time",
      what: "How quickly you respond to visual stimuli",
      detail: results.reactionTime
        ? `Your median reaction time was ${median(results.reactionTime.trials)}ms (average ${results.reactionTime.avgMs}ms). Under 200ms is elite, 200–280ms is good, and above 350ms suggests slower processing.`
        : "",
    },
    {
      name: "Stroop Test",
      percentile: results.stroop ? getStroopPercentile(results.stroop.accuracy, results.stroop.avgTimeMs) : null,
      path: "/test/stroop",
      what: "Your ability to suppress automatic responses and focus selectively",
      detail: results.stroop
        ? `You answered ${results.stroop.accuracy}% correctly with an average speed of ${results.stroop.avgTimeMs}ms. High accuracy + fast speed = strong cognitive control.`
        : "",
    },
    {
      name: "Sustained Attention (CPT)",
      percentile: results.cpt ? getCPTPercentile(results.cpt.hits, results.cpt.misses, results.cpt.falseAlarms, results.cpt.avgRT, results.cpt.totalStimuli) : null,
      path: "/test/cpt",
      what: "How well you maintain focus over time and avoid impulsive responses",
      detail: results.cpt
        ? `You detected ${results.cpt.hits} out of ${results.cpt.hits + results.cpt.misses} targets with ${results.cpt.falseAlarms} false alarm${results.cpt.falseAlarms !== 1 ? "s" : ""}. Fewer misses = better vigilance; fewer false alarms = better impulse control.`
        : "",
    },
    {
      name: "Sequence Memory",
      percentile: results.sequence ? getSequencePercentile(results.sequence.maxLevel) : null,
      path: "/test/sequence",
      what: "Your working memory capacity — how much you can hold in mind at once",
      detail: results.sequence
        ? `You reached a span of ${results.sequence.maxLevel}. The average person remembers 5–6 items; 7+ is above average, 9+ is exceptional.`
        : "",
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

        <div ref={screenshotRef} className="bg-background">
        <div className="mb-10">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Your Attention Profile</h1>
          <p className="text-sm text-muted-foreground">
            {completedCount}/4 tests completed. Percentile means the % of people you scored higher than.
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
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={`${overallScore * 2.64} 264`}
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
            <p className="mt-2 text-xs text-muted-foreground max-w-xs mx-auto">
              {rating?.description}
            </p>
          </div>
        )}

        {/* Individual Tests with explanations */}
        <div className="grid gap-4">
          {percentiles.map((test) => (
            <div
              key={test.name}
              className="rounded-2xl border-2 border-border bg-card p-4 md:p-5 animate-fade-in"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center mt-0.5">
                  {test.percentile !== null ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-border" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-bold">{test.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{test.what}</p>

                  {test.percentile !== null ? (
                    <>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-700"
                            style={{ width: `${test.percentile}%` }}
                          />
                        </div>
                        <span className="font-display text-sm font-bold text-primary shrink-0 w-16 text-right">
                          Top {100 - test.percentile}%
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {test.detail}
                      </p>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(test.path)}
                      className="mt-2 text-xs text-primary hover:underline font-display"
                    >
                      Take this test →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What these scores mean */}
        {completedCount > 0 && (
          <div className="mt-8 rounded-2xl border-2 border-border bg-card p-5 md:p-6 space-y-3 animate-fade-in">
            <h2 className="font-display text-sm font-bold">How to read your results</h2>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Percentile</strong> shows how you compare to the general population. 
                A score of 75 means you performed better than 75% of people.
              </p>
              <p>
                <strong className="text-foreground">Reaction Time</strong> measures raw processing speed — how fast your brain detects and responds to a stimulus.
              </p>
              <p>
                <strong className="text-foreground">Stroop</strong> measures selective attention and cognitive flexibility — your ability to ignore distracting information.
              </p>
              <p>
                <strong className="text-foreground">Sustained Attention</strong> measures vigilance — how consistently you can maintain focus without zoning out or responding impulsively.
              </p>
              <p>
                <strong className="text-foreground">Sequence Memory</strong> measures working memory — the mental "scratchpad" you use to hold and manipulate information.
              </p>
            </div>
          </div>
        )}
        </div>{/* end screenshotRef */}

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {completedCount < 4 && (
            <Button onClick={() => {
              const incomplete = percentiles.find(p => p.percentile === null);
              if (incomplete) navigate(incomplete.path);
            }}>
              Continue Testing
            </Button>
          )}
          {completedCount > 0 && (
            <ShareResults screenshotRef={screenshotRef} overallScore={overallScore} />
          )}
          {completedCount > 0 && (
            <Button variant="outline" onClick={() => { reset(); navigate("/"); }} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All
            </Button>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/60 max-w-sm mx-auto">
          Percentile rankings are estimated from published normative data. Results may vary based on device, environment, and testing conditions.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
