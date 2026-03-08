import TestLayout from "@/components/TestLayout";
import StroopTest from "@/components/tests/StroopTest";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const StroopPage = () => {
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  return (
    <TestLayout
      title="Stroop Test"
      description="Measures selective attention and cognitive flexibility. The Stroop Effect demonstrates interference between automatic reading and color identification — a cornerstone of cognitive psychology since 1935."
    >
      <StroopTest onComplete={() => setDone(true)} />
      {done && (
        <div className="mt-6 flex justify-center animate-fade-in">
          <Button variant="outline" onClick={() => navigate("/")}>Back to All Tests</Button>
        </div>
      )}
    </TestLayout>
  );
};

export default StroopPage;
