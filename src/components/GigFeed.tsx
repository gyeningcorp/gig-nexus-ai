import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MapPin, DollarSign } from "lucide-react";
import WorkerStats from "@/components/WorkerStats";

type Job = {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  location: string;
  scheduled_time: string | null;
  customer_id: string;
};

const GigFeed = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const acceptJob = async (jobId: string) => {
    const { error } = await supabase
      .from("jobs")
      .update({ worker_id: user?.id, status: "in_progress" })
      .eq("id", jobId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept job",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Job Accepted!",
        description: "The job has been added to your active jobs"
      });
      fetchJobs();
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading available gigs...</div>;
  }

  return (
    <div className="space-y-6">
      <WorkerStats />
      <h1 className="text-3xl font-bold">Available Gigs</h1>

      {jobs.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No gigs available right now. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <Badge variant="secondary" className="capitalize">
                    {job.type.replace("_", " ")}
                  </Badge>
                </div>
                <CardDescription className="mt-2">{job.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">${job.price.toFixed(2)}</span>
                </div>
                {job.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.scheduled_time && (
                  <div className="text-sm text-muted-foreground">
                    Scheduled: {new Date(job.scheduled_time).toLocaleString()}
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  variant="accent"
                  className="w-full"
                  onClick={() => acceptJob(job.id)}
                >
                  Accept Job
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GigFeed;
