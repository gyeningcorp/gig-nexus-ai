import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Briefcase, Star } from "lucide-react";
import { toast } from "sonner";

type WorkerStats = {
  activeJobs: number;
  totalEarnings: number;
  rating: number;
};

const WorkerStats = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<WorkerStats>({ activeJobs: 0, totalEarnings: 0, rating: 0 });

  useEffect(() => {
    if (user) {
      fetchWorkerStats();
    }
  }, [user]);

  const fetchWorkerStats = async () => {
    try {
      // Fetch active jobs
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("worker_id", user?.id)
        .eq("status", "in_progress");

      if (jobsError) throw jobsError;

      // Fetch total earnings (completed jobs)
      const { data: completedJobs, error: earningsError } = await supabase
        .from("jobs")
        .select("price")
        .eq("worker_id", user?.id)
        .eq("status", "completed");

      if (earningsError) throw earningsError;

      const totalEarnings = completedJobs?.reduce((sum, job) => sum + Number(job.price), 0) || 0;

      setStats({
        activeJobs: jobs?.length || 0,
        totalEarnings,
        rating: Number(profile?.rating) || 0,
      });
    } catch (error: any) {
      console.error("Error fetching worker stats:", error);
      toast.error("Failed to load stats");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-bold">{stats.activeJobs}</p>
            </div>
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">{stats.rating.toFixed(1)}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerStats;
