import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { DollarSign, Briefcase, Clock, Plus, Wallet, List } from "lucide-react";
import { toast } from "sonner";
import JobMapView from "./JobMapView";
import ConnectionStatus from "./ConnectionStatus";

type Job = {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  created_at: string;
  location_coordinates?: any;
  worker_id?: string;
};

type Stats = {
  totalJobs: number;
  activeJobs: number;
  totalSpent: number;
};

const CustomerDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalJobs: 0, activeJobs: 0, totalSpent: 0 });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [newlyAcceptedJobId, setNewlyAcceptedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }

    // Subscribe to job updates for real-time dashboard refresh
    if (!user) return;

    const channel = supabase
      .channel('dashboard-job-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `customer_id=eq.${user.id}`
        },
        (payload) => {
          const updatedJob = payload.new as any;
          
          // When job is accepted, show prominent notification and highlight map
          if (updatedJob.status === 'in_progress') {
            // Refresh dashboard data
            fetchDashboardData();
            
            // Set newly accepted job for highlighting
            setNewlyAcceptedJobId(updatedJob.id);
            
            // Show prominent toast notification
            toast.success(`🎉 Job Accepted!`, {
              description: `A worker is on their way for "${updatedJob.title}". Track their location below.`,
              duration: 10000,
            });
            
            // Scroll to active jobs section after a brief delay
            setTimeout(() => {
              const activeJobsSection = document.getElementById('active-jobs-section');
              activeJobsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
              setNewlyAcceptedJobId(null);
            }, 5000);
          } else {
            // For other updates, just refresh data
            fetchDashboardData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all jobs for stats
      const { data: allJobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("customer_id", user?.id);

      if (jobsError) throw jobsError;

      // Calculate stats
      const totalJobs = allJobs?.length || 0;
      const activeJobs = allJobs?.filter(job => 
        job.status === "in_progress" || 
        job.status === "open" || 
        job.status === "pending_confirmation"
      ).length || 0;
      const totalSpent = allJobs?.reduce((sum, job) => sum + Number(job.price), 0) || 0;

      setStats({ totalJobs, activeJobs, totalSpent });

      // Get recent jobs (last 5)
      const { data: recent, error: recentError } = await supabase
        .from("jobs")
        .select("*")
        .eq("customer_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      setRecentJobs(recent as Job[] || []);

      // Get active jobs with worker assignments for map display
      const { data: active, error: activeError } = await supabase
        .from("jobs")
        .select("*")
        .eq("customer_id", user?.id)
        .eq("status", "in_progress")
        .not("worker_id", "is", null);

      if (activeError) throw activeError;

      setActiveJobs(active as Job[] || []);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "pending_confirmation":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.name}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your jobs</p>
        </div>
        <ConnectionStatus />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">Jobs posted all time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">Currently in progress or open</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button size="lg" onClick={() => navigate("/new-job")} className="gap-2">
          <Plus className="w-4 h-4" />
          Post New Job
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/my-jobs")} className="gap-2">
          <List className="w-4 h-4" />
          View All Jobs
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/wallet")} className="gap-2">
          <Wallet className="w-4 h-4" />
          Wallet
        </Button>
      </div>

      {/* Active Jobs with Live Tracking */}
      {activeJobs.length > 0 && (
        <div id="active-jobs-section" className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Active Jobs - Live Tracking</h2>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600 font-medium">Live</span>
            </div>
          </div>
          <p className="text-muted-foreground">Track your worker's location in real-time</p>
          {activeJobs.map((job) => (
            <div 
              key={job.id} 
              className={`transition-all duration-500 ${
                newlyAcceptedJobId === job.id 
                  ? 'ring-4 ring-green-500 ring-opacity-50 rounded-lg animate-pulse' 
                  : ''
              }`}
            >
              <JobMapView
                jobLocation={job.location_coordinates}
                workerId={job.worker_id}
                jobTitle={job.title}
                showRoute={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No jobs posted yet</p>
              <Button onClick={() => navigate("/new-job")}>Post Your First Job</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/my-jobs")}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{job.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{job.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={getStatusColor(job.status)}>
                      {job.status.replace("_", " ")}
                    </Badge>
                    <p className="font-semibold">${Number(job.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
