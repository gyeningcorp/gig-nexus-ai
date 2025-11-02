import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCircle, Briefcase, Users } from "lucide-react";

type RoleSelectionProps = {
  onSelectRole: (role: "worker" | "customer" | "both") => void;
};

const RoleSelection = ({ onSelectRole }: RoleSelectionProps) => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How Will You Use GoGig?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your role and start your journey. You can always switch or do both.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group p-8 bg-card/50 backdrop-blur-sm border-border hover:border-accent/50 transition-all duration-300 hover:shadow-glow cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="p-6 rounded-2xl bg-gradient-card mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-12 h-12 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">I'm a Worker</h3>
              <p className="text-muted-foreground mb-6">
                Find gigs, earn money, and build your reputation
              </p>
              <Button 
                variant="accent"
                onClick={() => onSelectRole("worker")}
                className="w-full"
              >
                Continue as Worker
              </Button>
            </div>
          </Card>

          <Card className="group p-8 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="p-6 rounded-2xl bg-gradient-card mb-6 group-hover:scale-110 transition-transform">
                <UserCircle className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">I'm a Customer</h3>
              <p className="text-muted-foreground mb-6">
                Get services on-demand from verified workers
              </p>
              <Button 
                variant="hero"
                onClick={() => onSelectRole("customer")}
                className="w-full"
              >
                Continue as Customer
              </Button>
            </div>
          </Card>

          <Card className="group p-8 bg-card/50 backdrop-blur-sm border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-glow cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="p-6 rounded-2xl bg-gradient-card mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-12 h-12 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">I'm Both</h3>
              <p className="text-muted-foreground mb-6">
                Earn when you want, hire when you need
              </p>
              <Button 
                variant="secondary"
                onClick={() => onSelectRole("both")}
                className="w-full"
              >
                Continue as Both
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RoleSelection;
