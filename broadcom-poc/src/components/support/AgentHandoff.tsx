import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, MoreVertical } from "lucide-react";

const AgentHandoff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [waitTime, setWaitTime] = useState(3);
  
  // Get email from location state
  const email = location.state?.email;
  
  useEffect(() => {
    // If no email is provided, redirect to email verification
    if (!email) {
      navigate("/email-verification");
      return;
    }

    const timer = setInterval(() => {
      setWaitTime(prev => {
        if (prev > 1) return prev - 1;
        return prev;
      });
    }, 60000); // Update every minute
    
    // Automatically navigate to the main chat after a short delay (simulating connection)
    const connectionTimer = setTimeout(() => {
      // Navigate to main chat with state indicating live agent mode and agent name
      navigate("/", { 
        state: { 
          showLiveAgent: true,
          agentName: "Tracey",
          email: email
        }
      });
    }, 3000); // Navigate after 3 seconds to simulate connection
    
    return () => {
      clearInterval(timer);
      clearTimeout(connectionTimer);
    };
  }, [navigate, email]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-md border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#AE0E2A] p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/echostor-logo.png" 
              alt="EchoStor Logo" 
              className="h-10 w-10 object-contain"
            />
            <div className="flex items-center">
              <span className="font-bold text-lg tracking-wide">ECHOSTOR</span>
              <sup className="text-xs">®</sup>
            </div>
          </div>
          <div className="flex">
            <ChevronDown className="h-5 w-5" />
            <MoreVertical className="h-5 w-5 ml-2" />
          </div>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <div className="bg-[#A91E22]/10 rounded-full p-6 mb-6">
            <Loader2 className="h-12 w-12 animate-spin text-[#A91E22]" />
          </div>
          
          <h2 className="text-xl font-semibold text-center">Connecting to Live Agent</h2>
          <p className="text-center text-gray-500 mt-2">
            We're connecting you with a support specialist
          </p>
          
          <div className="w-full bg-gray-100 rounded-full h-2 mt-6 mb-2">
            <div className="bg-[#A91E22] h-2 rounded-full w-2/3 animate-pulse"></div>
          </div>
          
          <p className="text-sm text-gray-500">Estimated wait time: {waitTime} {waitTime === 1 ? 'minute' : 'minutes'}</p>
          
          <Button 
            variant="outline" 
            className="mt-6 rounded-full"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentHandoff;
