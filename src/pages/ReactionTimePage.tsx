import { useState } from "react";
import TestLayout from "@/components/TestLayout";
import ReactionTimeTest from "@/components/tests/ReactionTimeTest";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ReactionTimePage = () => {
  const [result, setResult] = useState<{ avg: number; trials: number[] } | null>(null);
  const navigate = useNavigate();

  const getRating = (avg: number) => {
    if (avg < 200) return "Exceptional";
    if (avg < 250) return "Above Average";
    if (avg < 300) return "Average";
    if (avg < 400) return "Below Average";
    return "Slow";
  };

  return (
    <TestLayout
      title="Reaction Time"
      description="Measures your psychomotor vigilance — how quickly your brain processes a visual stimulus and triggers a motor response. Based on the Psychomotor Vigilance Task (PVT) used in sleep and attention research."
    >
      <ReactionTimeTest onComplete={(avg, trials) => setResult({ avg, trials })} />
      {result && (
        <div className="mt-8 space-y-4 animate-fade-in">
          <div className="stat-card mx-auto max-w-[240px]">
            <span className="stat-value text-3xl">{result.avg}ms</span>
            <span className="stat-label">Average — {getRating(result.avg)}</span>
          </div>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>Back to All Tests</Button>
          </div>
        </div>
      )}
    </TestLayout>
  );
};

export default ReactionTimePage;
