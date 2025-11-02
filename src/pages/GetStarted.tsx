import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const GetStarted = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: "worker" | "customer" }>();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (!role) return;

    setLoading(true);
    const name = `${formData.firstName} ${formData.lastName}`;
    const { error } = await signUp(formData.email, formData.password, name, role);

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Account created successfully. Redirecting to dashboard..."
      });
      setTimeout(() => navigate("/dashboard"), 1500);
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2" />
          Back
        </Button>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-3xl">
              {role === "worker" ? "Start Working on GoGig" : "Get Started as a Customer"}
            </CardTitle>
            <CardDescription className="text-lg">
              {role === "worker"
                ? "Create your worker profile and start earning"
                : "Sign up to access on-demand services"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeToTerms: checked as boolean })
                  }
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>

              <Button
                type="submit"
                variant={role === "worker" ? "accent" : "hero"}
                className="w-full"
                disabled={!formData.agreeToTerms || loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="text-primary hover:underline">
                  Sign in
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default GetStarted;
