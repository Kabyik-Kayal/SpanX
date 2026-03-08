import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResultsProvider } from "@/context/ResultsContext";
import Index from "./pages/Index";
import ReactionTimePage from "./pages/ReactionTimePage";
import StroopPage from "./pages/StroopPage";
import CPTPage from "./pages/CPTPage";
import SequenceMemoryPage from "./pages/SequenceMemoryPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ResultsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/test/reaction-time" element={<ReactionTimePage />} />
            <Route path="/test/stroop" element={<StroopPage />} />
            <Route path="/test/cpt" element={<CPTPage />} />
            <Route path="/test/sequence" element={<SequenceMemoryPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ResultsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
