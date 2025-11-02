import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-secondary/10" />
      
      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">The Future of Gig Economy</span>
        </div>
        
        <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight">
          GoGig
        </h1>
        
        <p className="text-2xl md:text-3xl text-foreground/80 mb-4 font-light">
          One Platform. Every Opportunity.
        </p>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          Rideshare, delivery, home services, and freelance work unified in a single, AI-powered super-app. 
          Get paid instantly, work on your terms.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            variant="hero"
            className="group text-lg px-8 py-6"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg" 
            variant="glass"
            className="text-lg px-8 py-6"
          >
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border">
            <div className="text-3xl font-bold text-accent mb-2">500K+</div>
            <div className="text-sm text-muted-foreground">Active Workers</div>
          </div>
          <div className="p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border">
            <div className="text-3xl font-bold text-primary mb-2">$2M+</div>
            <div className="text-sm text-muted-foreground">Daily Earnings</div>
          </div>
          <div className="p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border">
            <div className="text-3xl font-bold text-secondary mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
