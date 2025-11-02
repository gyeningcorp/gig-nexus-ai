import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "lucide-react";

type Job = {
  id: string;
  title: string;
  scheduled_time: string | null;
  status: string;
};

const Schedule = () => {
  const [scheduledJobs, setScheduledJobs] = useState<Job[]>([]);
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchScheduledJobs();
  }, [user, profile]);

  const fetchScheduledJobs = async () => {
    if (!user) return;

    const query = profile?.role === "worker"
      ? supabase.from("jobs").select("*").eq("worker_id", user.id).not("scheduled_time", "is", null)
      : supabase.from("jobs").select("*").eq("customer_id", user.id).not("scheduled_time", "is", null);

    const { data, error } = await query.order("scheduled_time", { ascending: true });

    if (!error && data) {
      setScheduledJobs(data);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Schedule</h1>

        {scheduledJobs.length === 0 ? (
          <Card className="bg-card/50">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No scheduled jobs</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {scheduledJobs.map((job) => (
              <Card key={job.id} className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <span className="text-sm text-muted-foreground capitalize">
                      {job.status.replace("_", " ")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(job.scheduled_time!).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Schedule;
