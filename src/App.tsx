import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ResultsProvider } from "@/context/ResultsContext";
import ThemeToggle from "@/components/ThemeToggle";
import Index from "./pages/Index";
import ReactionTimePage from "./pages/ReactionTimePage";
import StroopPage from "./pages/StroopPage";
import CPTPage from "./pages/CPTPage";
import SequenceMemoryPage from "./pages/SequenceMemoryPage";
import ContinuousTestPage from "./pages/ContinuousTestPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <ResultsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <ThemeToggle />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/test/reaction-time" element={<ReactionTimePage />} />
              <Route path="/test/stroop" element={<StroopPage />} />
              <Route path="/test/cpt" element={<CPTPage />} />
              <Route path="/test/sequence" element={<SequenceMemoryPage />} />
              <Route path="/test" element={<ContinuousTestPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ResultsProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
