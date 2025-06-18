import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "./pages/Index"; // No longer needed for root path
import NotFound from "./pages/NotFound";
import EmailVerification from "./components/support/EmailVerification";
import OTPVerification from "./components/support/OTPVerification";
import AgentHandoff from "./components/support/AgentHandoff";
import SupportPageLayout from "./components/support/SupportPageLayout"; // Import the new layout

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Root renders Support layout (implicitly for Bot) */}
          <Route path="/" element={<SupportPageLayout page="bot" />} /> 
          {/* Documentation route also renders Support layout */}
          <Route path="/documentation" element={<SupportPageLayout page="documentation" />} />
          {/* Contact route also renders Support layout */}
          <Route path="/contact" element={<SupportPageLayout page="contact" />} />
          
          {/* Standalone routes */}
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/agent-handoff" element={<AgentHandoff />} />
          {/* Keep /support route as well, or remove if only root is desired */}
          {/* <Route path="/support" element={<SupportPageLayout />} /> */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
