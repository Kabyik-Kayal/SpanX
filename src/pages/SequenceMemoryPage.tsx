import TestLayout from "@/components/TestLayout";
import SequenceMemoryTest from "@/components/tests/SequenceMemoryTest";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResults } from "@/context/ResultsContext";

const SequenceMemoryPage = () => {
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { setSequence } = useResults();

  return (
    <TestLayout
      title="Sequence Memory"
      description="Based on the Corsi Block-Tapping Test, this measures your visuospatial working memory span — a key component of attention."
    >
      <SequenceMemoryTest onComplete={(maxLevel) => {
        setDone(true);
        setSequence({ maxLevel });
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

export default SequenceMemoryPage;
