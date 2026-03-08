import TestLayout from "@/components/TestLayout";
import SequenceMemoryTest from "@/components/tests/SequenceMemoryTest";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SequenceMemoryPage = () => {
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  return (
    <TestLayout
      title="Sequence Memory"
      description="Based on the Corsi Block-Tapping Test, this measures your visuospatial working memory span — a key component of attention. Your working memory capacity directly correlates with your ability to maintain focus."
    >
      <SequenceMemoryTest onComplete={() => setDone(true)} />
      {done && (
        <div className="mt-6 flex justify-center animate-fade-in">
          <Button variant="outline" onClick={() => navigate("/")}>Back to All Tests</Button>
        </div>
      )}
    </TestLayout>
  );
};

export default SequenceMemoryPage;
