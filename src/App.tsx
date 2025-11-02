import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewJob from "./pages/NewJob";
import MyJobs from "./pages/MyJobs";
import Wallet from "./pages/Wallet";
import Schedule from "./pages/Schedule";
import Ratings from "./pages/Ratings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/get-started/:role" element={<GetStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-job" element={<NewJob />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/ratings" element={<Ratings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
