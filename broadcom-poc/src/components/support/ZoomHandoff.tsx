import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ZoomHandoffProps {
  customerEmail: string;
  chatHistory: any[];
  onComplete: (success: boolean) => void;
}

const ZoomHandoff = ({ customerEmail, chatHistory, onComplete }: ZoomHandoffProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  const handleHandoff = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      // First, get a Zoom OAuth token
      const tokenResponse = await fetch('/.netlify/functions/zoom-oauth', {
        method: 'POST'
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get Zoom access token');
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      // Now perform the handoff
      const handoffResponse = await fetch('/.netlify/functions/zoom-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'handoff',
          token: accessToken,
          data: {
            customerEmail,
            chatHistory,
            intent: 'Technical Support' // You might want to make this dynamic
          }
        })
      });
      
      if (!handoffResponse.ok) {
        throw new Error('Handoff failed');
      }
      
      const handoffData = await handoffResponse.json();
      setChannelId(handoffData.channelId);
      
      toast({
        title: "Connected to Support",
        description: "A support agent has been assigned to help you",
      });
      
      // Store the channel ID in localStorage for future message sending
      if (handoffData.channelId) {
        console.log('Storing Zoom channel ID in localStorage:', handoffData.channelId);
        localStorage.setItem('zoom_channel_id', handoffData.channelId);
        
        // Also store current timestamp as the starting point for message polling
        localStorage.setItem('last_message_time', new Date().toISOString());
        console.log('Initialized message polling timestamp');
      } else {
        console.error('Warning: No channel ID received from Zoom API response:', handoffData);
      }
      
      // Report success back to the parent component
      if (onComplete) {
        onComplete(true);
      }
    } catch (error) {
      console.error('Handoff error:', error);
      setHasError(true);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to a support agent. Please try again.",
        variant: "destructive"
      });
      
      onComplete(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Automatically trigger handoff when component mounts
  useEffect(() => {
    handleHandoff();
  }, []);
  
  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h3 className="font-medium mb-2">Connecting to Support</h3>
      
      {isLoading && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting to an EchoStor support agent...</span>
        </div>
      )}
      
      {channelId && (
        <div className="text-sm text-green-600 mb-3">
          Successfully connected! An agent will assist you shortly.
        </div>
      )}
      
      {hasError && (
        <div className="mb-3">
          <div className="text-sm text-red-600 mb-2">
            There was an error connecting to support.
          </div>
          <Button 
            size="sm"
            onClick={handleHandoff}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Trying Again...
              </>
            ) : (
              "Retry Connection"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ZoomHandoff; 