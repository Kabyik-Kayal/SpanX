import TestLayout from "@/components/TestLayout";
import StroopTest from "@/components/tests/StroopTest";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResults } from "@/context/ResultsContext";

const StroopPage = () => {
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { setStroop } = useResults();

  return (
    <TestLayout
      title="Stroop Test"
      description="Measures selective attention and cognitive flexibility. The Stroop Effect demonstrates interference between automatic reading and color identification."
    >
      <StroopTest onComplete={(accuracy, avgTime) => {
        setDone(true);
        setStroop({ accuracy, avgTimeMs: avgTime });
      }} />
      {done && (
        <div className="mt-6 flex justify-center gap-3 animate-fade-in">
          <Button onClick={() => navigate("/dashboard")}>View Dashboard</Button>
          <Button variant="outline" onClick={() => navigate("/")}>All Tests</Button>
        </div>
      )}
    </TestLayout>
  );
};

export default StroopPage;
