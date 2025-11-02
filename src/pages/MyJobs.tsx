import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import JobMapView from "@/components/JobMapView";
import { useLocationTracking } from "@/hooks/useLocationTracking";

type Job = {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  status: string;
  worker_id: string | null;
  customer_id: string;
  location_coordinates?: {
    lat: number;
    lng: number;
  };
};

const MyJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Track worker location for active jobs
  const hasActiveJobs = jobs.some(job => job.status === "in_progress" && profile?.role === "worker");
  useLocationTracking(user?.id, hasActiveJobs);

  useEffect(() => {
    fetchJobs();
  }, [user, profile]);

  const fetchJobs = async () => {
    if (!user) return;

    const query = profile?.role === "worker"
      ? supabase.from("jobs").select("*").eq("worker_id", user.id)
      : supabase.from("jobs").select("*").eq("customer_id", user.id);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (!error && data) {
      setJobs(data as any);
    }
    setLoading(false);
  };

  const completeJob = async (job: Job) => {
    const { error: jobError } = await supabase
      .from("jobs")
      .update({ status: "completed" })
      .eq("id", job.id);

    if (jobError) {
      toast({
        title: "Error",
        description: "Failed to complete job",
        variant: "destructive"
      });
      return;
    }

    // Get worker's current balance and update it
    const { data: workerProfile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("user_id", job.worker_id)
      .single();

    if (workerProfile) {
      await supabase
        .from("profiles")
        .update({ wallet_balance: workerProfile.wallet_balance + job.price })
        .eq("user_id", job.worker_id);
    }

    // Create transaction record
    await supabase.from("transactions").insert({
      job_id: job.id,
      amount: job.price,
      sender_id: job.customer_id,
      receiver_id: job.worker_id,
      type: "payment"
    });

    toast({
      title: "Job Completed!",
      description: "Payment has been transferred to your wallet"
    });

    fetchJobs();
  };

  const cancelJob = async (jobId: string) => {
    const { error } = await supabase
      .from("jobs")
      .update({ status: "cancelled" })
      .eq("id", jobId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel job",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Job Cancelled",
        description: "The job has been cancelled"
      });
      fetchJobs();
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="animate-pulse">Loading your jobs...</div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">My Jobs</h1>

        {jobs.length === 0 ? (
          <Card className="bg-card/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No jobs yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <Badge variant={
                        job.status === "completed" ? "default" :
                        job.status === "in_progress" ? "secondary" :
                        job.status === "cancelled" ? "destructive" :
                        "outline"
                      } className="capitalize">
                        {job.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
                  </CardHeader>

                  <CardContent>
                    <div className="text-lg font-semibold">${job.price.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground capitalize">{job.type.replace("_", " ")}</div>
                  </CardContent>

                  <CardFooter className="gap-2">
                    {profile?.role === "worker" && job.status === "in_progress" && (
                      <Button variant="accent" className="w-full" onClick={() => completeJob(job)}>
                        Mark Complete
                      </Button>
                    )}
                    {profile?.role === "customer" && job.status === "open" && (
                      <Button variant="destructive" className="w-full" onClick={() => cancelJob(job.id)}>
                        Cancel Job
                      </Button>
                    )}
                  </CardFooter>
                </Card>

                {/* Show map for in-progress jobs with location coordinates */}
                {job.status === "in_progress" && job.location_coordinates && (
                  <JobMapView
                    jobLocation={job.location_coordinates}
                    workerId={job.worker_id || undefined}
                    customerId={job.customer_id}
                    jobTitle={job.title}
                    showRoute={!!job.worker_id}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default MyJobs;
