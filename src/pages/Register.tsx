import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    pin: '',
    ownedDocuments: [] as string[],
    agreeToTerms: false
  });

  const documentTypes = [
    { id: 'aadhaar', label: 'Aadhaar Card' },
    { id: 'pan', label: 'PAN Card' },
    { id: 'passport', label: 'Passport' },
    { id: 'driving_license', label: 'Driving License' },
    { id: 'voter_id', label: 'Voter ID' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocumentChange = (documentId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      ownedDocuments: checked 
        ? [...prev.ownedDocuments, documentId]
        : prev.ownedDocuments.filter(id => id !== documentId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.pin.length !== 4) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone,
        pin: formData.pin,
        owned_documents: formData.ownedDocuments
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Registration successful! Please check your email for verification.');
        // Redirect to auth page
        navigate('/auth');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
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

        {/* Registration Card */}
        <Card className="card-3d border-0 shadow-3d">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gradient-primary rounded-2xl w-fit glow-primary">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gradient">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-foreground/70">
              Join Virtual Setu and secure your digital identity
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>Full Name</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>Email Address</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Phone Number</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password" className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span>Password</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                    placeholder="Create a strong password"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                    placeholder="Confirm your password"
                  />
                </div>

                <div>
                  <Label htmlFor="pin" className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>4-Digit PIN (for Smart Card)</span>
                  </Label>
                  <Input
                    id="pin"
                    name="pin"
                    type="password"
                    required
                    maxLength={4}
                    value={formData.pin}
                    onChange={handleInputChange}
                    className="mt-1 bg-input/50 backdrop-blur-xl border-border/20"
                    placeholder="1234"
                  />
                </div>
              </div>

              {/* Document Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Which documents do you currently own?
                </Label>
                <div className="space-y-3">
                  {documentTypes.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={doc.id}
                        checked={formData.ownedDocuments.includes(doc.id)}
                        onCheckedChange={(checked) => 
                          handleDocumentChange(doc.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={doc.id} className="text-sm font-normal">
                        {doc.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                  }
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:scale-105 transition-transform glow-primary"
                size="lg"
              >
                Create Account
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-sm text-foreground/70">
                  Already have an account?{' '}
                  <Link to="/auth" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}