import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const verificationData = location.state?.verificationData || {};
  const { generatedOtp, email, otpExpiry } = verificationData;

  useEffect(() => {
    if (!generatedOtp || !email) {
      toast({
        title: "Verification Error",
        description: "Please start the verification process again.",
        variant: "destructive"
      });
      navigate("/email-verification");
    }
  }, [generatedOtp, email, navigate, toast]);

  const isOtpExpired = () => {
    if (!otpExpiry) return true;
    return new Date() > new Date(otpExpiry);
  };
  
  const handleVerify = () => {
    setIsVerifying(true);
    
    setTimeout(() => {
      if (isOtpExpired()) {
        toast({
          title: "Verification Failed",
          description: "Verification code has expired. Please request a new code.",
          variant: "destructive"
        });
        navigate("/email-verification");
        return;
      }
      
      if (otp === generatedOtp) {
        navigate("/agent-handoff", { state: { email } });
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          toast({
            title: "Verification Failed",
            description: "Too many failed attempts. Please try again later.",
            variant: "destructive"
          });
          navigate("/email-verification");
        } else {
          toast({
            title: "Invalid Code",
            description: `The verification code is incorrect. ${3 - newAttempts} attempts remaining.`,
            variant: "destructive"
          });
          setOtp("");
        }
      }
      
      setIsVerifying(false);
    }, 1000);
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
          <h2 className="text-lg font-medium text-center">Enter the OTP Code</h2>
          <p className="text-xs text-center text-gray-500">
            We've sent a verification code to {email}
          </p>
          <Input 
            placeholder="123456" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="text-center text-xl tracking-widest rounded-full"
            maxLength={6}
          />
          <div className="flex justify-between pt-2">
            <Link to="/email-verification">
              <Button variant="outline" className="rounded-full">Back</Button>
            </Link>
            <Button 
              onClick={handleVerify} 
              className="rounded-full bg-[#AE0E2A] hover:bg-[#8a1a1d]"
              disabled={!otp.trim() || otp.length < 6 || isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
