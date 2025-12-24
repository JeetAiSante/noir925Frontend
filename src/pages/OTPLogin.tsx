import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, Sparkles, Shield } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

const emailSchema = z.string().email('Please enter a valid email');
const phoneSchema = z.string().min(10, 'Please enter a valid phone number');

type VerifyMode = 'email' | 'phone';

const OTPLogin = () => {
  const [mode, setMode] = useState<VerifyMode>('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateInput = () => {
    if (mode === 'email') {
      const result = emailSchema.safeParse(identifier);
      if (!result.success) {
        setError(result.error.errors[0].message);
        return false;
      }
    } else {
      const result = phoneSchema.safeParse(identifier);
      if (!result.success) {
        setError(result.error.errors[0].message);
        return false;
      }
    }
    return true;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateInput()) return;

    setIsLoading(true);

    try {
      if (mode === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: identifier,
        });

        if (error) throw error;
      }

      setStep('verify');
      setCountdown(60);
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to your ${mode}.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let verifyError;
      if (mode === 'email') {
        const { error } = await supabase.auth.verifyOtp({
          email: identifier,
          token: otp,
          type: 'email',
        });
        verifyError = error;
      } else {
        const { error } = await supabase.auth.verifyOtp({
          phone: identifier,
          token: otp,
          type: 'sms',
        });
        verifyError = error;
      }

      if (verifyError) throw verifyError;

      toast({
        title: "Success!",
        description: "You have been signed in successfully.",
      });
      navigate('/');
    } catch (err: any) {
      setError('Invalid OTP. Please try again.');
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-md mx-auto">
          {/* Back Link */}
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>

          {/* Decorative Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Secure OTP Login
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Sign in securely with a one-time password
            </p>
          </div>

          <Card className="border-border/50 shadow-elegant">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg md:text-xl">
                {step === 'input' ? 'Enter Your Details' : 'Verify OTP'}
              </CardTitle>
              <CardDescription className="text-sm">
                {step === 'input' 
                  ? 'We\'ll send a verification code to your email' 
                  : `Enter the 6-digit code sent to ${identifier}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'input' ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  {/* Mode Toggle */}
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { setMode('email'); setError(''); setIdentifier(''); }}
                      className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                        mode === 'email' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('phone'); setError(''); setIdentifier(''); }}
                      className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                        mode === 'phone' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      Phone
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identifier">
                      {mode === 'email' ? 'Email Address' : 'Phone Number'}
                    </Label>
                    <div className="relative">
                      {mode === 'email' ? (
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      )}
                      <Input
                        id="identifier"
                        type={mode === 'email' ? 'email' : 'tel'}
                        placeholder={mode === 'email' ? 'your@email.com' : '+91 98765 43210'}
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          setError('');
                        }}
                        className={`pl-10 ${error ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Sending OTP...
                      </span>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-center block">Enter Verification Code</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => {
                          setOtp(value);
                          setError('');
                        }}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {error && (
                      <p className="text-sm text-destructive text-center">{error}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={countdown > 0}
                      className={`text-sm font-medium ${
                        countdown > 0 
                          ? 'text-muted-foreground cursor-not-allowed' 
                          : 'text-primary hover:underline'
                      }`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setStep('input'); setOtp(''); setError(''); }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Change {mode === 'email' ? 'email' : 'phone number'}
                  </button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Trust Badge */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Your data is encrypted and secure
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OTPLogin;
