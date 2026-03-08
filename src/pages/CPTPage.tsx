import TestLayout from "@/components/TestLayout";
import CPTTest from "@/components/tests/CPTTest";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CPTPage = () => {
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  return (
    <TestLayout
      title="Continuous Performance Test"
      description="The CPT is a gold-standard measure of sustained attention and vigilance. Used clinically in ADHD assessment, it measures your ability to maintain focus over time and inhibit impulsive responses."
    >
      <CPTTest onComplete={() => setDone(true)} />
      {done && (
        <div className="mt-6 flex justify-center animate-fade-in">
          <Button variant="outline" onClick={() => navigate("/")}>Back to All Tests</Button>
        </div>
      )}
    </TestLayout>
  );
};

export default CPTPage;
