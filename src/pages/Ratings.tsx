import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

type Job = {
  id: string;
  title: string;
  worker_id: string;
  customer_id: string;
};

type Rating = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
};

const Ratings = () => {
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === "customer") {
      fetchCompletedJobs();
    } else {
      fetchMyRatings();
    }
  }, [profile]);

  const fetchCompletedJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("customer_id", user?.id)
      .eq("status", "completed")
      .not("worker_id", "is", null);

    if (!error && data && data.length > 0) {
      // Filter out jobs that already have ratings
      const jobIds = data.map(j => j.id);
      const { data: existingRatings } = await supabase
        .from("ratings")
        .select("job_id")
        .in("job_id", jobIds);

      const ratedJobIds = new Set(existingRatings?.map(r => r.job_id) || []);
      setCompletedJobs(data.filter(j => !ratedJobIds.has(j.id)));
    } else {
      setCompletedJobs([]);
    }
  };

  const fetchMyRatings = async () => {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("worker_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRatings(data);
    }
  };

  const submitRating = async () => {
    if (!selectedJob || rating === 0) {
      toast({
        title: "Error",
        description: "Please select a job and rating",
        variant: "destructive"
      });
      return;
    }

    const job = completedJobs.find(j => j.id === selectedJob);

    const { error } = await supabase.from("ratings").insert({
      job_id: selectedJob,
      worker_id: job?.worker_id,
      customer_id: user?.id,
      rating,
      comment
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Rating Submitted!",
        description: "Thank you for your feedback"
      });
      setSelectedJob(null);
      setRating(0);
      setComment("");
      fetchCompletedJobs();
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Ratings</h1>

        {profile?.role === "worker" ? (
          <div>
            <Card className="bg-gradient-card border-primary/20 mb-6">
              <CardHeader>
                <CardTitle>Your Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.round(profile.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold">{profile.rating.toFixed(2)}</span>
                  <span className="text-muted-foreground">({profile.total_ratings} reviews)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {ratings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No ratings yet</p>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((r) => (
                      <div key={r.id} className="p-4 rounded-lg bg-background/50">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                              }`}
                            />
                          ))}
                        </div>
                        {r.comment && <p className="text-sm">{r.comment}</p>}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Rate a Completed Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {completedJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No jobs to rate
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Select Job</Label>
                    <select
                      className="w-full p-2 rounded-md border border-input bg-background"
                      value={selectedJob || ""}
                      onChange={(e) => setSelectedJob(e.target.value)}
                    >
                      <option value="">Choose a job...</option>
                      {completedJobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 cursor-pointer ${
                              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment (Optional)</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button variant="accent" className="w-full" onClick={submitRating}>
                    Submit Rating
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Ratings;
