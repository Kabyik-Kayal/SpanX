import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TestLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const TestLayout = ({ title, description, children }: TestLayoutProps) => {
  const navigate = useNavigate();

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
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default TestLayout;
