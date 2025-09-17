import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    pin: ''
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (registerData.pin.length !== 4) {
      toast.error('PIN must be exactly 4 digits');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(registerData.email, registerData.password, {
        full_name: registerData.fullName,
        phone: registerData.phone,
        pin: registerData.pin
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Please check your email to verify your account.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-mesh">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-foreground/70 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Auth Card */}
        <Card className="card-3d border-0 shadow-3d">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gradient-primary rounded-2xl w-fit glow-primary">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gradient">
              Virtual Setu
            </CardTitle>
            <CardDescription className="text-foreground/70">
              Secure your digital identity
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>Email Address</span>
                    </Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password" className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <span>Password</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="mt-1 bg-input/50 backdrop-blur-xl border-border/20 pr-10"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:scale-105 transition-transform glow-primary"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name" className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>Full Name</span>
                    </Label>
                    <Input
                      id="register-name"
                      name="fullName"
                      type="text"
                      required
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>Email Address</span>
                    </Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      required
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-phone" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>Phone Number</span>
                    </Label>
                    <Input
                      id="register-phone"
                      name="phone"
                      type="tel"
                      required
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-password" className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <span>Password</span>
                    </Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      required
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                      placeholder="Create a strong password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <Input
                      id="register-confirm"
                      name="confirmPassword"
                      type="password"
                      required
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-pin" className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>4-Digit PIN</span>
                    </Label>
                    <Input
                      id="register-pin"
                      name="pin"
                      type="password"
                      required
                      maxLength={4}
                      value={registerData.pin}
                      onChange={handleRegisterChange}
                      className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                      placeholder="1234"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:scale-105 transition-transform glow-primary"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}