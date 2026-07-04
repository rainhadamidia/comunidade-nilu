import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PresenceProvider } from "@/hooks/usePresence";
import { PointsToast } from "@/components/PointsToast";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Diagnostico from "./pages/Diagnostico";
import NovoProjeto from "./pages/NovoProjeto";
import MeuProjeto from "./pages/MeuProjeto";
import Premium from "./pages/Premium";
import Challenges from "./pages/Challenges";
import Community from "./pages/Community";
import SafeSpace from "./pages/SafeSpace";
import Contents from "./pages/Contents";
import Personalities from "./pages/Personalities";
import Profile from "./pages/Profile";
import SelfCare from "./pages/SelfCare";
import AnnualChallenges from "./pages/AnnualChallenges";
import Admin from "./pages/Admin";
import Feed from "./pages/Feed";
import Ranking from "./pages/Ranking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PresenceProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PointsToast />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/novo-projeto" element={<NovoProjeto />} />
            <Route path="/meu-projeto" element={<MeuProjeto />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/annual-challenges" element={<AnnualChallenges />} />
            <Route path="/community" element={<Community />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/safe-space" element={<SafeSpace />} />
            <Route path="/contents" element={<Contents />} />
            <Route path="/self-care" element={<SelfCare />} />
            <Route path="/personalities" element={<Personalities />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </PresenceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
