import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, MoreVertical, ThumbsUp, ThumbsDown, Send, ChevronRight, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ZoomHandoff from './ZoomHandoff';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown

// --- Helper function to get current time formatted ---
const getCurrentTimeFormatted = () => {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

interface Message {
  type: string;
  text: string;
  time: string;
  showNotHelpful?: boolean;
  id: string; // Unique identifier for each message
  inputType?: string; // To display special input types like email or OTP
  metadata?: any; // For storing additional data with messages
  citations?: {
    id: number;
    text?: string;
    title?: string;
    source?: string;
    url?: string;
  }[];
  fcsScore?: number; // Add Factual Consistency Score field
  isSkeleton?: boolean; // flag for streaming placeholder
  agent?: string; // Added agent property
  // --- NEW: Add actions for buttons ---
  actions?: { label: string; onClick: () => void }[];
  isAccountInfo?: boolean; // Flag to identify account info messages
  accountData?: { // Store the data used to generate the message
      name: string;
      company: string;
      support_tier: string;
      // Add other fields if needed for button generation
  };
}

interface MainChatProps {
  initialMessage?: string | null;
}

// -- Define initial message structure (without time) --
const initialBotMessage: Omit<Message, 'time' | 'actions'> = { // Exclude actions from this type for the first message
  type: "bot",
  text: "Welcome to the EchoStor Virtual Assistant. I can help with anything EchoStor related. How can I help you today?",
  id: "initial-welcome" // Changed ID slightly
};

const sessionId: string = Date.now().toString();


// --- NEW: Updated initial message structure with actions ---
const initialOptionsMessage: Omit<Message, 'time'> = {
  type: "bot",
  text: "Get started by selecting a support area or managing your account.",
  id: "initial-options",
  // actions: [ // Will be added dynamically in component state
  //   { label: "Lookup Account Info", onClick: () => {} }, // Placeholder
  // ]
};

// Global messages remain (though now less critical with state initialization)
let globalMessages: Message[] = [
  // Initial messages will be set in state
];

// Re-add CitationProps interface
interface CitationProps {
  citations: {
    id: number;
    text?: string;
    title?: string;
    source?: string;
    url?: string;
  }[];
}

// --- Updated Dropdown Component to include FCS ---
interface SourceInfoDropdownProps {
  fcsScore: number | null | undefined;
  citations: {
    title?: string;
    snippet?: string; // Assuming this field name from previous code
    url?: string;
  }[];
}

const SourceInfoDropdown: React.FC<SourceInfoDropdownProps> = ({ fcsScore, citations }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Show top 3 citations or fewer if less than 3 exist
  const topCitations = citations.slice(0, 3);
  
  // Show sources if we have citations (always show confidence as "High" when sources exist)
  const hasCitations = citations.length > 0;
  const hasDataToShow = hasCitations;

  // Don't render dropdown if no meaningful data to show
  if (!hasDataToShow) {
    return null;
  }

  return (
    <div className="mt-3 pt-2 border-t border-gray-200">
      {/* Only show the Sources button if there are citations */}
      {hasCitations && (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Sources ({citations.length})
        </button>
      )}
      
      {/* Always show confidence as High when there are sources */}
      {hasCitations && (
        <div className="mt-2">
          <span className="text-sm text-gray-600">Confidence Score: </span>
          <span className="text-green-600 font-medium">High</span>
        </div>
      )}

      {/* Sources dropdown */}
      {isOpen && hasCitations && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Sources:</h4>
          <ul className="space-y-2">
            {topCitations.map((citation, index) => (
              <li key={index} className="text-xs">
                <div className="font-medium text-gray-800">{citation.title}</div>
                {citation.snippet && (
                  <div className="text-gray-600 mt-1">{citation.snippet}</div>
                )}
                {citation.url && (
                  <a 
                    href={citation.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 underline mt-1 block"
                  >
                    View Source
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- NEW: Re-added cleanResponseText function ---
const cleanResponseText = (text: string): string => {
  if (!text) return text;

  // Remove "Based on the provided sources..." preamble (optional)
  let cleanedText = text.replace(/^Based on (?:the )?provided sources(?:,)?(.*?)(?:(?:here is|this is)(?: a)? summary)?(?:.*?)?:/i, '');

  // Remove disclaimer notes about sources (optional)
  cleanedText = cleanedText.replace(/(?:\n|^)Note(?:\s|:|that).*?(?:sources|source|docs|documents|information).*?(?:\n|$)/i, '\n');

  // Remove other standard disclaimers (optional)
  cleanedText = cleanedText.replace(/(?:\n|^)Please note.*?(?:\n|$)/i, '\n');
  cleanedText = cleanedText.replace(/(?:\n|^)It(?:\s| is) important to note.*?(?:\n|$)/i, '\n');
  cleanedText = cleanedText.replace(/(?:\n|^)It should be noted.*?(?:\n|$)/i, '\n');

  // Remove citation reference numbers like [1], [2, 3, 4], etc.
  cleanedText = cleanedText.replace(/\[\d+(?:,\s*\d+)*\]/g, '');

  // Clean up double spaces and multiple line breaks
  cleanedText = cleanedText.replace(/\s{2,}/g, ' ');
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');

  // Trim whitespace
  return cleanedText.trim();
};
// --- END: Re-added cleanResponseText function ---

const MainChat = ({ initialMessage }: MainChatProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // --- NEW: Handler to start account lookup flow ---
  const handleStartAccountLookup = () => {
    setIsAccountVerification(true); // Start email prompt for account lookup
    setAccountMgmtAction('lookup');

    const botMessage = {
        type: "bot" as const,
        text: "To look up your account information, please enter the email address associated with your EchoStor account.",
        time: getCurrentTimeFormatted(),
        id: `bot-${Date.now()}-acct-email-prompt`,
        inputType: "email" as const
    };
    setMessages(prev => [...prev, botMessage]);
  };

  // --- Initialize state with dynamic time for initial messages ---
  const [messages, setMessages] = useState<Message[]>([
    {
      ...initialBotMessage,
      time: getCurrentTimeFormatted() // Set time dynamically
    },
    //{
    //  ...initialOptionsMessage,
    //  time: getCurrentTimeFormatted(), // Set time dynamically
    //  actions: [ // Add actions here dynamically
    //    { label: "Lookup Account Info", onClick: handleStartAccountLookup },
    //    // Add other initial actions/buttons here if needed
    //  ]
    //}
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  // --- RENAMED Handoff OTP states ---
  const [handoffEmail, setHandoffEmail] = useState<string | null>(null); // Stores email for handoff OTP verification
  const [isHandoffEmailVerification, setIsHandoffEmailVerification] = useState(false); // Trigger email prompt for HANDOFF
  const [isHandoffOtpVerification, setIsHandoffOtpVerification] = useState(false); // Trigger OTP prompt for HANDOFF
  // const [otpAttempts, setOtpAttempts] = useState(0); // Potentially reuse or keep separate?
  // const [verificationData, setVerificationData] = useState<{ // Potentially reuse or keep separate?
  //   email: string;
  //   generatedOtp: string;
  //   otpExpiry: string;
  // } | null>(null);

  // --- Account Management State ---
  const [isAccountVerification, setIsAccountVerification] = useState(false); // Triggers email prompt for account actions
  const [isAccountOtpVerification, setIsAccountOtpVerification] = useState(false); // Triggers OTP prompt for account actions
  const [accountMgmtAction, setAccountMgmtAction] = useState<'lookup' | 'update' | null>(null); // What to do after OTP/verification
  const [accountMgmtEmail, setAccountMgmtEmail] = useState<string | null>(null); // Verified email for account action
  const [fieldToUpdate, setFieldToUpdate] = useState<string | null>(null); // Field user wants to update (NEW)
  // ---

  // Add state for zoom handoff
  const [isZoomHandoff, setIsZoomHandoff] = useState(false);
  const [zoomHandoffComplete, setZoomHandoffComplete] = useState(false); // Keep this to manage the ZoomHandoff component lifecycle

  // ... rest of the state variables (live agent, typing etc.) ...
  const [email, setEmail] = useState(""); // Keep original email state if needed for other things? Review usage
  const [showLiveAgent, setShowLiveAgent] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentID, setAgentID] = useState("");
  const [agentChannel, setAgentChannel] = useState("");
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [typingTimeoutId, setTypingTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (showLiveAgent) {
      // ... existing live agent polling logic ...
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [showLiveAgent, lastMessageTime]);

  useEffect(() => {
    if (location.state?.showLiveAgent) {
      // ... existing logic to handle direct navigation to live agent ...
      // Ensure we clear any account/handoff verification states if navigating directly here
      setIsHandoffEmailVerification(false);
      setIsHandoffOtpVerification(false);
      setIsAccountVerification(false);
      setIsAccountOtpVerification(false);
      setIsZoomHandoff(false); // Should already be false, but just in case
    }
  }, [location.state]);

  useEffect(() => {
    if (initialMessage) {
      // ... existing logic to add initialMessage ...
    }
  }, [initialMessage]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const callAgentBackend = async (query: string): Promise<{ text: string | null; fcsScore: number | null; citations: any[] }> => {
    setIsLoading(true);
    const agent_endpoint = 'http://localhost:8001/chat'
    try {
      console.log("Agent backend session ID: " + sessionId);
      console.log("Sending query to agent backend:", query);
      // Use accountMgmtEmail if available, otherwise use handoffEmail, otherwise fallback
      const currentEmail = accountMgmtEmail || handoffEmail || 'nobody@email.com';
      const response = await fetch(agent_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '123456',
          'session': sessionId,
          'email': currentEmail
        },
        body: JSON.stringify({
          query: query
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        console.error('Agent backend error:', response.status, errorData);
        const errorMsg = errorData?.detail || errorData?.error || `Error processing request (${response.status})`;
        return { text: `Sorry, there was an error: ${errorMsg}`, fcsScore: null, citations: [] };
      }

      const data = await response.json();
      console.log("Received response from agent backend:", data);
      console.log("FCS Score from backend:", data.fcs_score);
      console.log("Citations from backend:", data.citations);
      console.log("Response text from backend:", data.response_text || data.response);

      const rawResponse = data.response || data.response_text || "Sorry, I couldn't get a response from the agent.";
      const cleanedResponse = cleanResponseText(rawResponse);
      const fcsScore = data.fcs_score;
      const citations = data.citations || [];

      console.log("Processed values - FCS Score:", fcsScore, "Citations count:", citations.length);

      return { text: cleanedResponse, fcsScore, citations };

    } catch (error) {
      console.error('Error calling agent backend:', error);
      let errorText = "Sorry, an unexpected error occurred while trying to connect to the support agent.";
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorText = "Connection Error: Could not reach the agent backend. Please ensure it's running at " + agent_endpoint;
      }
      return { text: errorText, fcsScore: null, citations: [] };
    } finally {
      setIsLoading(false);
    }
  };

  // --- Function to call the agent backend ---
  const callLiveAgentChatLookup = async (email: string): Promise<{ name: string; id: string; channel: string }> => {
    const agent_endpoint = 'http://localhost:8001/live-agent-lookup'
    try {
      console.log("Sending request to live-agent-lookup backend for ", email);
      console.log("Agent backend session ID: " + sessionId);
      const response = await fetch(agent_endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '123456',
          'session': sessionId,
          'email': email || 'nobody@email.com'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        console.error('live-agent-lookup backend error:', response.status, errorData);
        const errorMsg = errorData?.detail || errorData?.error || `Error processing request (${response.status})`;
        return { name: `Error: ${errorMsg}`, id: "", channel: "" };
      }

      const data = await response.json();
      console.log("Received response from live-agent-lookup backend:", data);

      const liveAgentName = data.name;
      const liveAgentId = data.id;
      const liveAgentChannel = data.channel;

      return { name: liveAgentName, id: liveAgentId, channel: liveAgentChannel };

    } catch (error) {
      console.error('Error calling live-agent-lookup backend:', error);
      let errorText = "Sorry, an unexpected error occurred while trying to look up the live agent information.";
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorText = "Connection Error: Could not reach the live-agent-lookup backend. Please ensure it's running at " + agent_endpoint;
      }
      return { name: errorText, id: "", channel: "" };
    } finally {
      //setIsLoading(false);
    }
  };

  // --- Function to send Zoom handoff message to live agent ---
  const sendZoomHandoffMessage = async (liveAgentName: string, liveAgentId: string, liveAgentChannel: string, userEmail: string, messages: string[]): Promise<{ responseText: string }> => {
    console.log("Sending live agent handoff message to " + liveAgentName + " with id " + liveAgentId + " and channel " + liveAgentChannel);
    console.log("Chat history is " + messages);

    try {
      // First, get a Zoom OAuth token
      const tokenResponse = await fetch('/.netlify/functions/zoom-oauth', {
        method: 'POST'
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get Zoom access token: ' + tokenResponse);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      console.log("accessToken is " + accessToken);

      // Now send the handoff message
      const handoffResponse = await fetch('/.netlify/functions/zoom-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'handoff',
          token: accessToken,
          data: {
            userEmail,
            messages,
            channel: liveAgentChannel
          }
        })
      });

      if (!handoffResponse.ok) {
        throw new Error('Handoff failed: ' + handoffResponse);
      }

      const handoffData = await handoffResponse.json();

      toast({
        title: "Connected to Support",
        description: "A support agent has been assigned to help you",
      });

      return { responseText: JSON.stringify(handoffData) };

    } catch (error) {
      console.error('Handoff error:', error);
      //setHasError(true);

      toast({
        title: "Connection Error",
        description: "Unable to connect to a support agent. Please try again.",
        variant: "destructive"
      });

      //onComplete(false);
    } finally {
      //setIsLoading(false);
    }

  };

  const handleSupportAreaClick = (area: string) => {
    // ... existing logic ...
  };

  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return emailRegex.test(email);
  };

  const isEchostorEmail = (email: string) => {
    return email.toLowerCase().endsWith('@echostor.com');
  };

  const handleNotHelpful = () => {
    // If user has already been verified (e.g., via account flow), go straight to Zoom handoff?
    // OR always trigger handoff verification? Let's always trigger handoff verification for now.

    // Start HANDOFF email verification
    setIsHandoffEmailVerification(true);
    // Clear any lingering account verification states
    setIsAccountVerification(false);
    setIsAccountOtpVerification(false);
    setAccountMgmtEmail(null);
    setAccountMgmtAction(null);

    // Add bot message prompting for email for HANDOFF

    let botMessageText : string = "I'm sorry I couldn't help. To connect you with a support specialist, please enter your email address for verification."
    if (accountMgmtEmail) {
        botMessageText = "I'm sorry I couldn't help. To connect you with a support specialist, please confirm your email address for verification.",
        setInputValue(accountMgmtEmail);
    }
    const botMessage = {
      type: "bot" as const,
      text: botMessageText,
      time: getCurrentTimeFormatted(),
      id: `bot-${Date.now()}-handoff-email-prompt`,
      inputType: "email" as const
    };

    setMessages(prev => {
      const updatedMessages = [...prev, botMessage];
      globalMessages = updatedMessages;
      return updatedMessages;
    });
  };

  const handleHelpful = (messageId: string) => {
    // Hide feedback buttons on the specific message
    setMessages(prev => {
      const updatedMessages = prev.map(msg =>
        msg.id === messageId ? { ...msg, showNotHelpful: false } : msg
      );
      globalMessages = updatedMessages; // Update global state
      return updatedMessages;
    });
  };

  // --- NEW: Handler to start an update flow --- 
  const handleStartUpdate = (field: 'name' | 'company' | 'support_tier') => {
    if (!accountMgmtEmail) { 
        toast({ title: "Error", description: "User email not verified in this session.", variant: "destructive"});
        return;
    }
    
    setAccountMgmtAction('update');
    setFieldToUpdate(field); // Track which field we are updating

    const agentPrompt = `User ${accountMgmtEmail} wants to update their ${field}.`;
    
    // Add a user-like message to show intent (optional, but good UX)
    const intentMessage = {
        type: "user",
        text: `I want to update my ${field}.`, // User perspective
        time: getCurrentTimeFormatted(),
        id: `user-${Date.now()}-update-intent`
    };
    setMessages(prev => [...prev, intentMessage]);

    // Send the prompt to the agent 
    handleSendMessage(agentPrompt, true); // Pass true to indicate this is an internal prompt
  };

  // --- MODIFIED handleSendMessage ---
  const handleSendMessage = (textToSend?: string, isInternalPrompt: boolean = false) => {
    const messageText = textToSend ?? inputValue;
    if (!messageText.trim()) return;
    const backendUrl = 'http://localhost:8001';

    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(messageText.trim())) {
      setAccountMgmtEmail(messageText.trim());
    }

    // 0. Check if in live agent mode
    if (showLiveAgent) {
      // Logic to send message to live agent via Netlify function
      const userMessage: Message = {
        type: "user", text: messageText, time: getCurrentTimeFormatted(), id: `user-${Date.now()}-live`
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue("");

      const channelId = localStorage.getItem('zoom_channel_id');
      const senderEmail = handoffEmail || accountMgmtEmail || "Unknown User"; // Use verified email if available
      if (!channelId) {
        toast({ title: "Error", description: "Live agent connection lost. No channel ID.", variant: "destructive" });
        return;
      }

      setIsLoading(true); // Show loading spinner while sending
      fetch('/.netlify/functions/send-zoom-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channelId, message: messageText, senderEmail: senderEmail }) // Pass senderEmail
      })
      .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.message || 'Failed to send message'); });
        return response.json();
      })
      .then(data => {
        console.log("Message sent to Zoom:", data);
        // Optionally add a 'delivered' status locally? Depends on desired UX.
      })
      .catch(error => {
        console.error("Error sending message to live agent:", error);
        toast({ title: "Send Error", description: `Could not send message to live agent: ${error.message}`, variant: "destructive" });
        // Optionally add the message back to the input? Or mark as failed?
      })
      .finally(() => setIsLoading(false));

      return; // Stop processing here for live agent messages
    }

    // 1. Handle Account Email Verification Step (ONLY FOR INITIAL LOOKUP/VERIFY)
    // Note: We ensure this only triggers if accountMgmtAction is 'lookup' or null initially
    if (isAccountVerification && accountMgmtAction !== 'update') { 
        const enteredEmail = messageText.trim();
        if (validateEmailFormat(enteredEmail)) {
            const userMessage: Message = {
                type: 'user', text: enteredEmail, time: getCurrentTimeFormatted(), id: `user-${Date.now()}-acct-email`
            };
            setMessages(prev => [...prev, userMessage]);
            setInputValue("");
            setIsLoading(true);

            fetch(`${backendUrl}/otp/send`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: enteredEmail })
            })
            .then(response => {
                if (!response.ok) return response.json().then(err => { throw new Error(err.detail || 'Failed to send OTP'); });
                return response.json();
            })
            .then(data => {
                setAccountMgmtEmail(enteredEmail); // Store email for OTP step
                const botMessage = {
                    type: "bot" as const,
                    text: `For security, an OTP has been sent to ${enteredEmail}. Please enter the 6-digit code to proceed with your account ${accountMgmtAction} request.`,
                    time: getCurrentTimeFormatted(), id: `bot-${Date.now()}-acct-otp-prompt`, inputType: "otp" as const
                };
                setMessages(prev => [...prev, botMessage]);
                setIsAccountVerification(false);
                setIsAccountOtpVerification(true);
            })
            .catch(error => {
                console.error("Error sending Account OTP:", error);
                toast({ title: "Account OTP Send Error", description: error.message || "Could not send OTP.", variant: "destructive" });
                setAccountMgmtEmail(null); // Clear email on failure
            })
            .finally(() => setIsLoading(false));
        } else {
            toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
        }
        return; // Stop processing here
    }

    // 2. Handle Account OTP Verification Step (ONLY FOR INITIAL LOOKUP/VERIFY)
    // Note: We ensure this only triggers if accountMgmtAction is 'lookup' or null initially
    if (isAccountOtpVerification && accountMgmtAction !== 'update') { 
        const enteredOtp = messageText.trim();
        if (/^\d{6}$/.test(enteredOtp) && accountMgmtEmail) {
            const userMessage: Message = {
                type: 'user', text: '******', time: getCurrentTimeFormatted(), id: `user-${Date.now()}-acct-otp`
            };
            setMessages(prev => [...prev, userMessage]);
            setInputValue("");
            setIsLoading(true);

            fetch(`${backendUrl}/otp/verify`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: accountMgmtEmail, otp: enteredOtp })
            })
            .then(response => {
                if (!response.ok) return response.json().then(err => { throw new Error(err.detail || 'OTP Verification Failed'); });
                return response.json();
            })
            .then(data => {
                // Account OTP Verified Successfully for LOOKUP!
                const botMessage = {
                    type: "bot" as const, text: `Verification successful for ${accountMgmtEmail}. Looking up account details...`,
                    time: getCurrentTimeFormatted(), id: `bot-${Date.now()}-acct-verified`
                };
                setMessages(prev => [...prev, botMessage]);

                // Send LOOKUP prompt to agent endpoint (which bypasses agent and returns data)
                const agentPrompt = `User ${accountMgmtEmail} has been successfully verified via OTP to lookup your account information. Please proceed.`;
                callAgentBackend(agentPrompt).then(agentResponse => {
                     // --- MODIFIED: Flag the account info message & store data ---
                     const accountInfoMessage = {
                         type: "bot" as const,
                         text: agentResponse.text || "Could not retrieve account details.",
                         time: getCurrentTimeFormatted(),
                         id: `bot-${Date.now()}-acct-info`,
                         isAccountInfo: true, // Flag this message
                         // Attempt to parse data for buttons (simple parsing, might need improvement)
                         accountData: parseAccountDataFromText(agentResponse.text || ""),
                         fcsScore: agentResponse.fcsScore, // Will be null
                         citations: agentResponse.citations // Will be empty
                     };
                     setMessages(prev => [...prev, accountInfoMessage]);
                 });
                 
                setIsAccountOtpVerification(false); // End OTP stage
                // Keep accountMgmtEmail set, clear action? Let's clear action after lookup
                setAccountMgmtAction(null); 

            })
            .catch(error => {
                console.error("Error verifying Account OTP:", error);
                 toast({
                  title: "Account OTP Failed",
                  description: error.message.includes('Invalid OTP') ? "Invalid OTP entered." :
                               error.message.includes('expired') ? "The OTP has expired." :
                               error.message.includes('not found') ? "OTP not found or already used." :
                               "Verification failed. Please try again.",
                  variant: "destructive",
                });
                 // Don't reset state on failure, allow retry
            })
            .finally(() => setIsLoading(false));
        } else {
             toast({ title: "Invalid Code", description: "Please enter the 6-digit code.", variant: "destructive" });
        }
        return; // Stop processing here
    }

    // 3. Handle HANDOFF Email Verification Step
    if (isHandoffEmailVerification) {
        const enteredEmail = messageText.trim();
        if (validateEmailFormat(enteredEmail)) {
            const userMessage: Message = {
                type: 'user', text: enteredEmail, time: getCurrentTimeFormatted(), id: `user-${Date.now()}-handoff-email`
            };
            setMessages(prev => [...prev, userMessage]);
            setInputValue("");
            setIsLoading(true);

            fetch(`${backendUrl}/otp/send`, { // Use the same OTP endpoint
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: enteredEmail })
            })
            .then(response => {
                if (!response.ok) return response.json().then(err => { throw new Error(err.detail || 'Failed to send OTP'); });
                return response.json();
            })
            .then(data => {
                setHandoffEmail(enteredEmail); // Store email for handoff OTP step
                const botMessage = {
                    type: "bot" as const,
                    text: `For security, an OTP has been sent to ${enteredEmail}. Please enter the 6-digit code to connect with a live agent.`,
                    time: getCurrentTimeFormatted(), id: `bot-${Date.now()}-handoff-otp-prompt`, inputType: "otp" as const
                };
                setMessages(prev => [...prev, botMessage]);
                setIsHandoffEmailVerification(false); // Move from email prompt state
                setIsHandoffOtpVerification(true);   // Move to OTP prompt state
            })
            .catch(error => {
                console.error("Error sending Handoff OTP:", error);
                toast({ title: "Handoff OTP Send Error", description: error.message || "Could not send OTP.", variant: "destructive" });
                setHandoffEmail(null); // Clear email on failure
            })
            .finally(() => setIsLoading(false));
        } else {
            toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
        }
        return; // Stop processing here
    }

    // 4. Handle HANDOFF OTP Verification Step
    if (isHandoffOtpVerification) {
        const enteredOtp = messageText.trim();
        if (/^\d{6}$/.test(enteredOtp) && handoffEmail) {
            const userMessage: Message = {
                type: 'user', text: '******', time: getCurrentTimeFormatted(), id: `user-${Date.now()}-handoff-otp`
            };
            setMessages(prev => [...prev, userMessage]);
            setInputValue("");
            setIsLoading(true);

            fetch(`${backendUrl}/otp/verify`, { // Use the same OTP endpoint
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: handoffEmail, otp: enteredOtp })
            })
            .then(response => {
                if (!response.ok) return response.json().then(err => { throw new Error(err.detail || 'OTP Verification Failed'); });
                return response.json();
            })
            .then(data => {
                // Handoff OTP Verified Successfully!
                setIsHandoffOtpVerification(false); // End OTP stage
                setIsZoomHandoff(true); // START ZOOM HANDOFF

                // --- Call backend to look up live agent info ---
                (async () => {
                  const liveAgentInfoResponse = await callLiveAgentChatLookup(handoffEmail);
                  console.info("liveAgentInfoResponse=" + liveAgentInfoResponse);
                  const liveAgentName = liveAgentInfoResponse.name;
                  const liveAgentId = liveAgentInfoResponse.id;
                  const liveAgentChannel = liveAgentInfoResponse.channel;
                  //localStorage.setItem('live_agent_name', liveAgentName);
                  //localStorage.setItem('live_agent_id', liveAgentId);
                  //localStorage.setItem('live_agent_channel', liveAgentChannel);
                  setAgentName(liveAgentName);
                  setAgentID(liveAgentId);
                  setAgentChannel(liveAgentChannel);
                  console.info("liveAgentName=" + liveAgentName);
                  console.info("liveAgentId=" + liveAgentId);
                  console.info("liveAgentChannel=" + liveAgentChannel);

                  const liveAgentHandoffInfoMessage = {
                    type: "bot" as const,
                    text: `Verification successful for ${handoffEmail}. We are connecting you with ${liveAgentName} who will take it from here.`,
                    time: getCurrentTimeFormatted(),
                    id: `bot-${Date.now()}-handoff-connecting`
                  };
                  setMessages(prev => [...prev, liveAgentHandoffInfoMessage]);

                  //backend service call to post a message to the selected live agent channel with the chat history
                  const messageHistory = messages.map(msg => `${msg.type}: ${msg.text}`);
                  const zoomHandoffResponse = await sendZoomHandoffMessage(liveAgentName, liveAgentId, liveAgentChannel, handoffEmail, messageHistory);
                  console.log("zoomHandoffResponse: " + zoomHandoffResponse);

                  const liveAgentMessage = {
                    type: "live-agent" as const,
                    text: `Hello, this is ${liveAgentName}. I'm here to help ...`,
                    time: getCurrentTimeFormatted(),
                    id: `bot-${Date.now()}-handoff-intro`
                  };
                  setMessages(prev => [...prev, liveAgentMessage]);
                  setIsLoading(false);
                  setZoomHandoffComplete(true);
                  setIsZoomHandoff(false);
                })();

                //TODO async block to call function that polls for receipt of a message from that live agent or channel, and only returns once it gets a message

                // The ZoomHandoff component will take over UI rendering
            })
            .catch(error => {
                console.error("Error verifying Handoff OTP:", error);
                toast({
                  title: "Handoff OTP Failed",
                  description: error.message.includes('Invalid OTP') ? "Invalid OTP entered." :
                               error.message.includes('expired') ? "The OTP has expired." :
                               error.message.includes('not found') ? "OTP not found or already used." :
                               "Verification failed. Please try again.",
                  variant: "destructive",
                });
                // Don't reset state on failure, allow retry
            })
            .finally(() => setIsLoading(false));
        } else {
             toast({ title: "Invalid Code", description: "Please enter the 6-digit code.", variant: "destructive" });
        }
        return; // Stop processing here
    }

    // 5. Default Chat Logic / Agent Interaction
    // Add user message ONLY if it's not an internal prompt
    if (!isInternalPrompt) {
        const userMessage: Message = {
            type: "user", text: messageText, time: getCurrentTimeFormatted(), id: `user-${Date.now()}`
        };
        setMessages(prev => {
            const updatedMessages = [...prev, userMessage];
            globalMessages = updatedMessages;
            return updatedMessages;
        });
        setInputValue("");
    } else {
        // Clear input even for internal prompts if needed?
        // setInputValue(""); 
    }

    // Show skeleton message while waiting for response
    const skeletonMessageId = `bot-skeleton-${Date.now()}`;
    const skeletonMessage = {
      type: "bot" as const, text: "", time: "", id: skeletonMessageId, isSkeleton: true
    };
    setMessages(prev => [...prev, skeletonMessage]);

    // Call the agent backend with the user's message OR the internal prompt
    callAgentBackend(messageText).then(agentResponse => {
        const cleanedText = cleanResponseText(agentResponse.text || "Sorry, I encountered an issue processing your request.");
        const botResponse = {
            type: "bot" as const,
            text: cleanedText, 
            time: getCurrentTimeFormatted(),
            showNotHelpful: true, // Allow feedback on agent responses
            id: `bot-${Date.now()}-agent-response`,
            fcsScore: agentResponse.fcsScore, 
            citations: agentResponse.citations 
        };

        // Replace skeleton message with actual response
        setMessages(prev => prev.map(msg => msg.id === skeletonMessageId ? botResponse : msg));
        globalMessages = messages.map(msg => msg.id === skeletonMessageId ? botResponse : msg); 

    }).catch(error => {
       // ... handle error ...
    });

  }; // End handleSendMessage

  // --- NEW: Helper to parse account data from text for buttons --- 
  const parseAccountDataFromText = (text: string): Message['accountData'] => {
      // Basic parsing - assumes format from backend bypass
      const nameMatch = text.match(/Okay, I found the following account information for (.*?)\s+\(/);
      const companyMatch = text.match(/- Company: (.*?)\n/);
      const tierMatch = text.match(/- Support Tier: (.*?)\n/);
      return {
          name: nameMatch ? nameMatch[1] : "",
          company: companyMatch ? companyMatch[1] : "",
          support_tier: tierMatch ? tierMatch[1] : ""
      };
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Message List Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.type !== "user" ? (
              <>
                <p className="text-xs font-semibold mb-2 flex items-center">
                  <span className="mr-3 text-echostor-navy-700">
                    {message.type === "live-agent" ? (message.agent || agentName) :
                      message.type === "system" ? "System" : "Support"}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${
                    message.type === "live-agent" ? "bg-gradient-to-r from-echostor-teal-100 to-echostor-teal-200 text-echostor-teal-800 border border-echostor-teal-200" :
                    message.type === "system" ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200" :
                    "bg-gradient-to-r from-echostor-lime-100 to-echostor-lime-200 text-echostor-lime-800 border border-echostor-lime-200"
                  }`}>
                    {message.type === "live-agent" ? "LIVE AGENT" :
                      message.type === "system" ? "INFO" : "BOT"}
                  </span>
                  <span className="text-xs text-echostor-gray-500 ml-auto font-medium">{message.time}</span>
                </p>
                <div className="flex items-start space-x-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src="/echostor-logo.svg"
                      alt="Bot Icon"
                      className="h-8 w-8 rounded-full shadow-sm border-2 border-white"
                    />
                    {/* Subtle teal glow around the avatar */}
                    <div className="absolute inset-0 bg-echostor-teal-400 opacity-20 blur-md rounded-full -z-10"></div>
                  </div>
                   <div className={`flex-1 rounded-2xl p-4 shadow-card border transition-all duration-300 hover:shadow-card-hover ${
                    message.type === "live-agent" ? "bg-gradient-to-br from-echostor-teal-50 to-white border-echostor-teal-100" :
                    message.type === "system" ? "bg-gradient-to-br from-green-50 to-white border-green-100" :
                    "bg-gradient-to-br from-echostor-lime-50 to-white border-echostor-lime-100"
                  } max-w-[85%]`}>
                    {message.isSkeleton ? (
                      <div className="space-y-3">
                        <div className="h-3 bg-gradient-to-r from-echostor-gray-200 to-echostor-gray-300 rounded-full animate-pulse w-3/4" />
                        <div className="h-3 bg-gradient-to-r from-echostor-gray-200 to-echostor-gray-300 rounded-full animate-pulse w-1/2" />
                      </div>
                    ) : (
                      <>
                        <div className="prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-echostor-lime-700">
                          <ReactMarkdown
                            components={{
                                a: ({node, ...props}) => (
                                    <a
                                        {...props}
                                        className="text-echostor-teal-600 hover:text-echostor-teal-800 font-medium underline hover:no-underline transition-colors duration-200"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    />
                                ),
                                li: ({node, ...props}) => (
                                  <li {...props} className="pb-2 text-echostor-navy-700" />
                                ),
                                p: ({node, ...props}) => (
                                  <p {...props} className="mb-3 text-echostor-navy-700" />
                                )
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                        {/* Account Update Buttons with lime green styling */}
                        {message.isAccountInfo && message.accountData && (
                            <div className="mt-4 pt-4 border-t border-echostor-gray-200 flex flex-wrap gap-2">
                                {message.accountData.name && 
                                    <Button variant="outline" size="sm" className="text-xs bg-gradient-to-r from-white to-echostor-lime-50 border-echostor-lime-300 hover:from-echostor-lime-50 hover:to-echostor-lime-100 hover:border-echostor-lime-400 hover:text-echostor-lime-700 text-echostor-lime-600 transition-all duration-300" onClick={() => handleStartUpdate('name')}>Update Name</Button>}
                                {message.accountData.company && 
                                    <Button variant="outline" size="sm" className="text-xs bg-gradient-to-r from-white to-echostor-lime-50 border-echostor-lime-300 hover:from-echostor-lime-50 hover:to-echostor-lime-100 hover:border-echostor-lime-400 hover:text-echostor-lime-700 text-echostor-lime-600 transition-all duration-300" onClick={() => handleStartUpdate('company')}>Update Company</Button>}
                                {message.accountData.support_tier && 
                                    <Button variant="outline" size="sm" className="text-xs bg-gradient-to-r from-white to-echostor-lime-50 border-echostor-lime-300 hover:from-echostor-lime-50 hover:to-echostor-lime-100 hover:border-echostor-lime-400 hover:text-echostor-lime-700 text-echostor-lime-600 transition-all duration-300" onClick={() => handleStartUpdate('support_tier')}>Update Support Tier</Button>}
                            </div>
                        )}
                        {/* Original Action Buttons with lime green styling */}
                        {message.actions && message.actions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-echostor-gray-200 flex flex-wrap gap-2">
                                {message.actions.map((action, index) => (
                                    <Button key={index} variant="outline" size="sm" onClick={action.onClick} className="text-xs rounded-full h-auto py-2 px-4 bg-gradient-to-r from-white to-echostor-lime-50 border-echostor-lime-300 hover:from-echostor-lime-50 hover:to-echostor-lime-100 hover:border-echostor-lime-400 hover:text-echostor-lime-700 text-echostor-lime-600 transition-all duration-300">{action.label}</Button>
                                ))}
                            </div>
                        )}
                        {/* Source Info Dropdown */}
                        <SourceInfoDropdown
                            fcsScore={message.fcsScore}
                            citations={message.citations || []}
                        />
                        {/* Enhanced Helpful/Not Helpful Buttons */}
                        {message.showNotHelpful && (
                          <div className="mt-4 pt-4 border-t border-echostor-gray-200 flex space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleHelpful(message.id)}
                              className="text-xs rounded-full h-auto py-2 px-4 bg-gradient-to-r from-green-50 to-white border-green-200 hover:from-green-100 hover:to-green-50 hover:border-green-300 hover:text-green-700 text-green-600 transition-all duration-300 group"
                            >
                              <ThumbsUp className="h-3 w-3 mr-2 group-hover:scale-110 transition-transform duration-200" /> Helpful
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleNotHelpful}
                              className="text-xs rounded-full h-auto py-2 px-4 bg-gradient-to-r from-echostor-red-50 to-white border-echostor-red-200 hover:from-echostor-red-100 hover:to-echostor-red-50 hover:border-echostor-red-300 hover:text-echostor-red-700 text-echostor-red-600 transition-all duration-300 group"
                            >
                              <ThumbsDown className="h-3 w-3 mr-2 group-hover:scale-110 transition-transform duration-200" /> Not Helpful
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold mb-2 flex items-center justify-end">
                  <span className="text-xs text-echostor-gray-500 mr-3 font-medium">{message.time}</span>
                  <span className="mr-3 text-echostor-navy-700">You</span>
                </p>
                <div className="flex items-start space-x-4 justify-end">
                  <div className="bg-gradient-to-r from-echostor-lime-500 to-echostor-lime-600 rounded-2xl p-4 max-w-[85%] shadow-card border border-echostor-lime-400 text-echostor-navy-900">
                    <p className="text-echostor-navy-900 font-medium">{message.text}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        {/* ... existing indicators and Zoom Handoff ... */}
        <div ref={messagesEndRef} />
      </div>
      {/* Enhanced Input Area with light styling */}
      <div className="border-t border-echostor-gray-200 bg-white px-6 py-4 flex-shrink-0 shadow-lg">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isAccountVerification ? "Enter account email address..." :
              isAccountOtpVerification ? "Enter 6-digit code for account..." :
              isHandoffEmailVerification ? "Enter email for agent handoff..." :
              isHandoffOtpVerification ? "Enter 6-digit code for handoff..." :
              showLiveAgent ? `Message ${agentName}...` :
              "Type your message..."
            }
            className="rounded-full border-echostor-gray-300 bg-white shadow-sm focus:border-echostor-lime-500 focus:ring-echostor-lime-500 focus:shadow-card transition-all duration-300 text-echostor-navy-700 placeholder:text-echostor-gray-500"
            maxLength={isAccountOtpVerification || isHandoffOtpVerification ? 6 : undefined}
            type={isAccountOtpVerification || isHandoffOtpVerification ? "tel" : "text"}
            inputMode={isAccountOtpVerification || isHandoffOtpVerification ? "numeric" : "text"}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (inputValue.trim() || showLiveAgent) {
                   if (inputValue.trim()){ handleSendMessage();}
                }
              }
            }}
            disabled={isLoading || (isZoomHandoff && !zoomHandoffComplete)}
          />
          <Button
            size="sm"
            className="rounded-full bg-gradient-to-r from-echostor-lime-500 to-echostor-lime-600 hover:from-echostor-lime-600 hover:to-echostor-lime-700 h-12 w-12 p-0 flex items-center justify-center flex-shrink-0 shadow-lime-glow hover:shadow-card-hover transition-all duration-300 transform hover:scale-105 border-2 border-echostor-lime-400 text-echostor-navy-900"
            onClick={(e) => {
              e.preventDefault();
              if (inputValue.trim()) {
                handleSendMessage();
              }
            }}
            disabled={!inputValue.trim() || isLoading || (isZoomHandoff && !zoomHandoffComplete)}
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-echostor-navy-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="h-5 w-5 text-echostor-navy-900" />
            )}
          </Button>
        </div>
        {(isAccountOtpVerification || isHandoffOtpVerification) && (
          <p className="text-xs text-echostor-gray-500 mt-3 text-center max-w-4xl mx-auto">
            Enter the 6-digit code sent to {isAccountOtpVerification ? accountMgmtEmail : handoffEmail}
          </p>
        )}
      </div>
    </div>
  );
};

export default MainChat;

