import TestLayout from "@/components/TestLayout";
import CPTTest from "@/components/tests/CPTTest";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResults } from "@/context/ResultsContext";

const CPTPage = () => {
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { setCPT } = useResults();

  return (
    <TestLayout
      title="Continuous Performance Test"
      description="The CPT is a gold-standard measure of sustained attention and vigilance. Used clinically in ADHD assessment."
    >
      <CPTTest onComplete={(hits, misses, falseAlarms, avgRT) => {
        setDone(true);
        setCPT({ hits, misses, falseAlarms, avgRT });
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

export default CPTPage;
