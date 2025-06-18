
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MainChat from "@/components/support/MainChat";

const Index = () => {
  const location = useLocation();
  const [specialMessage, setSpecialMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if there's a special message from navigation state
    if (location.state && location.state.specialMessage) {
      setSpecialMessage(location.state.specialMessage);
      
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <MainChat initialMessage={specialMessage} />
    </div>
  );
};

export default Index;
