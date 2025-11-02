import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Car, Package, Home, Briefcase, PawPrint, ShoppingCart, 
  MapPin, Clock, DollarSign, Star, Search, Filter, Menu 
} from "lucide-react";

type GigMarketplaceProps = {
  role: "worker" | "customer" | "both";
};

const mockGigs = [
  {
    id: 1,
    type: "rideshare",
    icon: Car,
    title: "Airport Pickup",
    location: "Downtown → Airport",
    distance: "12 miles",
    time: "30 min",
    pay: 45,
    rating: 4.9,
    urgent: true,
  },
  {
    id: 2,
    type: "delivery",
    icon: Package,
    title: "Package Delivery",
    location: "Retail Store → Residence",
    distance: "3 miles",
    time: "15 min",
    pay: 18,
    rating: 5.0,
    urgent: false,
  },
  {
    id: 3,
    type: "home",
    icon: Home,
    title: "House Cleaning",
    location: "3BR Apartment",
    distance: "5 miles",
    time: "2 hours",
    pay: 120,
    rating: 4.8,
    urgent: false,
  },
  {
    id: 4,
    type: "freelance",
    icon: Briefcase,
    title: "Logo Design",
    location: "Remote",
    distance: "Online",
    time: "3 days",
    pay: 300,
    rating: 4.7,
    urgent: true,
  },
];

const GigMarketplace = ({ role }: GigMarketplaceProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              GoGig
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {role.charAt(0).toUpperCase() + role.slice(1)} Mode
            </Badge>
            <Button variant="ghost" size="icon">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search gigs by location, service, or pay..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg bg-card border-border"
          />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="text-2xl font-bold text-primary">24</div>
            <div className="text-xs text-muted-foreground">Available Gigs</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-accent/20">
            <div className="text-2xl font-bold text-accent">$1,240</div>
            <div className="text-xs text-muted-foreground">Today's Potential</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-secondary/20">
            <div className="text-2xl font-bold text-secondary">2.4mi</div>
            <div className="text-xs text-muted-foreground">Avg Distance</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border">
            <div className="text-2xl font-bold text-foreground">Hot</div>
            <div className="text-xs text-muted-foreground">Market Status</div>
          </Card>
        </div>

        {/* Gig Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            {role === "worker" ? "Available Gigs Near You" : "Book a Service"}
          </h2>
          
          {mockGigs.map((gig) => {
            const Icon = gig.icon;
            return (
              <Card
                key={gig.id}
                className="group p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-card">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{gig.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{gig.location}</span>
                        </div>
                      </div>
                      {gig.urgent && (
                        <Badge variant="destructive" className="animate-pulse">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 mb-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{gig.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{gig.distance}</span>
                      </div>
                      <div className="flex items-center gap-1 text-accent">
                        <Star className="w-4 h-4 fill-accent" />
                        <span>{gig.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold text-primary">${gig.pay}</span>
                      </div>
                      <Button variant="hero" size="sm" className="group-hover:scale-105 transition-transform">
                        {role === "worker" ? "Accept Gig" : "Book Now"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GigMarketplace;
