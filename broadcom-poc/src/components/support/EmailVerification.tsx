import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EmailVerification = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return emailRegex.test(email);
  };
  
  const isEchostorEmail = (email: string) => {
    return email.toLowerCase().endsWith('@echostor.com');
  };
  
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (emailError) {
      setEmailError("");
    }
  };
  
  const handleContinue = async () => {
    if (!email.trim()) {
      setEmailError("Email cannot be empty");
      return;
    }
    
    if (!validateEmailFormat(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    if (isEchostorEmail(email)) {
      setIsSubmitting(false);
      navigate("/", { 
        state: { 
          specialMessage: "Please contact 1.Bot for further assistance" 
        }
      });
      return;
    }

    const generatedOtp = generateOTP();
    const otpExpiry = new Date(new Date().getTime() + 5 * 60000).toISOString();
    
    try {
      // Call the OTP function directly without test function
      console.log('FETCH: Calling send-otp function');
      const response = await fetch('/.netlify/functions/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, otp: generatedOtp }),
      });
      console.log('FETCH: Received response status:', response.status);

      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        let details: any = {};
        try {
          const errorText = await response.text();
          console.error('Error sending OTP (raw response):', errorText);
          try {
            details = JSON.parse(errorText);
            errorMsg = details?.error || details?.message || errorMsg;
          } catch (parseError) {
            errorMsg = errorText || errorMsg;
          }
        } catch (readError) {
          console.error("Could not read error response body:", readError);
        }
        
        toast({
          title: "Email Error",
          description: `Failed to send verification code. ${errorMsg}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Generated OTP (for local testing):", generatedOtp);
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${email}`,
      });
      
      navigate("/otp-verification", {
        state: {
          verificationData: {
            email,
            generatedOtp,
            otpExpiry
          }
        }
      });

    } catch (error) {
      console.error("Network error sending OTP:", error);
      toast({
        title: "Network Error",
        description: "Could not reach verification service. Please check your connection and try again.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Card className="w-full max-w-md border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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
        
        <CardContent className="pt-6 px-6 pb-6 space-y-4">
          <h2 className="text-lg font-medium text-center">Enter your Email</h2>
          <div className="space-y-2">
            <Input 
              placeholder="you@example.com" 
              value={email}
              onChange={handleEmailChange}
              className="rounded-full"
            />
            {emailError && (
              <p className="text-xs text-red-500 pl-3">{emailError}</p>
            )}
          </div>
          <div className="flex justify-between pt-2">
            <Link to="/">
              <Button variant="outline" className="rounded-full">Back</Button>
            </Link>
            <Button 
              onClick={handleContinue} 
              className="rounded-full bg-[#AE0E2A] hover:bg-[#8a1a1d]"
              disabled={!email.trim() || isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
