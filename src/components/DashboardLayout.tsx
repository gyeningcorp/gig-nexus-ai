import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Briefcase, Wallet, Calendar, Star, LogOut, Plus } from "lucide-react";

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const workerLinks = [
    { path: "/dashboard", label: "Gig Feed", icon: Home },
    { path: "/my-jobs", label: "My Jobs", icon: Briefcase },
    { path: "/wallet", label: "Wallet", icon: Wallet },
    { path: "/schedule", label: "Schedule", icon: Calendar },
    { path: "/ratings", label: "Ratings", icon: Star },
  ];

  const customerLinks = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/new-job", label: "Post Job", icon: Plus },
    { path: "/my-jobs", label: "My Jobs", icon: Briefcase },
    { path: "/wallet", label: "Wallet", icon: Wallet },
    { path: "/schedule", label: "Schedule", icon: Calendar },
  ];

  const links = profile?.role === "worker" ? workerLinks : customerLinks;
  
  if (!profile?.role) return null; // Wait for role to load

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                GoGig
              </h1>
              <div className="hidden md:flex gap-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={link.path}
                      variant={isActive(link.path) ? "default" : "ghost"}
                      onClick={() => navigate(link.path)}
                      className="gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{profile?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
              </div>
              <Button variant="ghost" onClick={signOut} size="icon">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="md:hidden flex gap-2 mt-4 overflow-x-auto">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.path}
                  variant={isActive(link.path) ? "default" : "ghost"}
                  onClick={() => navigate(link.path)}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
