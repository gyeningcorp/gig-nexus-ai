import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import JobMapView from "@/components/JobMapView";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { SimulatedGPS, calculateDistance, estimateTravelTime } from "@/utils/simulatedGPS";
import { Navigation, Clock, MapPin, CheckCircle } from "lucide-react";
import ConnectionStatus from "@/components/ConnectionStatus";
import LiveTrackingIndicator from "@/components/LiveTrackingIndicator";

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
  const [simulatedLocation, setSimulatedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const gpsSimulatorRef = useRef<SimulatedGPS | null>(null);
  
  // Track worker location for active jobs
  const hasActiveJobs = jobs.some(job => job.status === "in_progress" && profile?.role === "worker");
  useLocationTracking(user?.id, hasActiveJobs);

  useEffect(() => {
    fetchJobs();

    // Subscribe to job updates for real-time changes
    if (!user) return;

    const channel = supabase
      .channel('job-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: profile?.role === 'customer' 
            ? `customer_id=eq.${user.id}` 
            : `worker_id=eq.${user.id}`
        },
        (payload) => {
          const updatedJob = payload.new as Job;
          
          // Update job in local state
          setJobs(prev => prev.map(job => 
            job.id === updatedJob.id ? updatedJob : job
          ));

          // Notifications for CUSTOMER
          if (profile?.role === 'customer') {
            if (updatedJob.status === 'in_progress') {
              toast({
                title: "🎉 Job Accepted!",
                description: `A worker is on their way for "${updatedJob.title}". Track them in real-time on the map!`,
                duration: 10000,
              });
            } else if (updatedJob.status === 'pending_confirmation') {
              toast({
                title: "⏰ Job Completed - Action Required",
                description: `Worker has completed "${updatedJob.title}". Please confirm to release payment.`,
                duration: 15000,
              });
            } else if (updatedJob.status === 'completed') {
              toast({
                title: "✅ Job Confirmed",
                description: `"${updatedJob.title}" is complete. Payment sent to worker.`,
                duration: 5000,
              });
            } else if (updatedJob.status === 'cancelled') {
              toast({
                title: "❌ Job Cancelled",
                description: `"${updatedJob.title}" has been cancelled.`,
                duration: 5000,
              });
            }
          }

          // Notifications for WORKER
          if (profile?.role === 'worker') {
            if (updatedJob.status === 'in_progress') {
              toast({
                title: "🎯 Job Accepted",
                description: `You've accepted "${updatedJob.title}". Head to the location now!`,
                duration: 10000,
              });
            } else if (updatedJob.status === 'pending_confirmation') {
              toast({
                title: "⏰ Waiting for Customer",
                description: `"${updatedJob.title}" marked complete. Awaiting customer confirmation.`,
                duration: 8000,
              });
            } else if (updatedJob.status === 'completed') {
              toast({
                title: "💰 Payment Received!",
                description: `Customer confirmed "${updatedJob.title}". Payment added to wallet.`,
                duration: 10000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile, toast]);

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

  // Worker marks job as pending confirmation (doesn't complete immediately)
  const markPendingConfirmation = async (jobId: string) => {
    // Stop GPS simulation
    if (gpsSimulatorRef.current) {
      gpsSimulatorRef.current.stop();
      gpsSimulatorRef.current = null;
      setSimulatedLocation(null);
      setProgress(0);
    }

    const { error } = await supabase
      .from("jobs")
      .update({ status: "pending_confirmation" })
      .eq("id", jobId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Awaiting Confirmation",
        description: "Customer will confirm job completion before payment"
      });
      fetchJobs();
    }
  };

  // Customer confirms job completion and releases payment
  const confirmJobCompletion = async (job: Job) => {
    const { error: jobError } = await supabase
      .from("jobs")
      .update({ status: "completed" })
      .eq("id", job.id);

    if (jobError) {
      toast({
        title: "Error",
        description: "Failed to confirm job",
        variant: "destructive"
      });
      return;
    }

    // Deduct from customer wallet
    const { data: customerProfile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("user_id", job.customer_id)
      .single();

    if (customerProfile) {
      await supabase
        .from("profiles")
        .update({ wallet_balance: customerProfile.wallet_balance - job.price })
        .eq("user_id", job.customer_id);
    }

    // Add to worker wallet
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
      title: "Payment Released!",
      description: `$${job.price.toFixed(2)} transferred to worker`
    });

    fetchJobs();
  };

  // Start simulated GPS for worker navigation
  const startNavigation = (job: Job) => {
    if (!job.location_coordinates) {
      toast({
        title: "No Location",
        description: "Job location not available",
        variant: "destructive"
      });
      return;
    }

    // Use simulated start location (can be replaced with real geolocation)
    const startLocation = { lat: job.location_coordinates.lat - 0.05, lng: job.location_coordinates.lng - 0.05 };
    const endLocation = job.location_coordinates;

    // Calculate initial distance and time
    const distance = calculateDistance(startLocation, endLocation);
    setEstimatedTime(Math.round(estimateTravelTime(distance)));

    // Create GPS simulator
    if (gpsSimulatorRef.current) {
      gpsSimulatorRef.current.stop();
    }

    gpsSimulatorRef.current = new SimulatedGPS(
      startLocation,
      endLocation,
      (location, progressPercent) => {
        setSimulatedLocation(location);
        setProgress(progressPercent);
        
        // Update estimated time based on remaining distance
        const remainingDistance = calculateDistance(location, endLocation);
        setEstimatedTime(Math.round(estimateTravelTime(remainingDistance)));
      }
    );

    gpsSimulatorRef.current.start(3000); // Update every 3 seconds

    toast({
      title: "Navigation Started",
      description: "Simulated GPS route active"
    });
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

  // Cleanup GPS simulator on unmount
  useEffect(() => {
    return () => {
      if (gpsSimulatorRef.current) {
        gpsSimulatorRef.current.stop();
      }
    };
  }, []);

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">My Jobs</h1>
            {hasActiveJobs && profile?.role === "worker" && (
              <LiveTrackingIndicator isTracking={true} label="Location Tracking Active" />
            )}
          </div>
          <ConnectionStatus />
        </div>

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
                {/* Navigation Banner for Active Jobs (Worker View) */}
                {profile?.role === "worker" && job.status === "in_progress" && simulatedLocation && (
                  <Alert className="bg-gradient-primary border-primary">
                    <Navigation className="h-4 w-4" />
                    <AlertTitle className="font-bold">Navigation Active</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>ETA: {estimatedTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>Progress: {Math.round(progress)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-background/20 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Pending Confirmation Alert (Customer View) */}
                {profile?.role === "customer" && job.status === "pending_confirmation" && (
                  <Alert className="bg-yellow-500/10 border-yellow-500/20">
                    <CheckCircle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-500">Awaiting Your Confirmation</AlertTitle>
                    <AlertDescription className="text-yellow-500/80">
                      Worker has marked this job as complete. Please confirm to release payment.
                    </AlertDescription>
                  </Alert>
                )}

                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <Badge variant={
                        job.status === "completed" ? "default" :
                        job.status === "in_progress" ? "secondary" :
                        job.status === "pending_confirmation" ? "outline" :
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

                  <CardFooter className="gap-2 flex-col sm:flex-row">
                    {/* Worker Actions */}
                    {profile?.role === "worker" && job.status === "in_progress" && (
                      <>
                        {!simulatedLocation && (
                          <Button 
                            variant="secondary" 
                            className="w-full" 
                            onClick={() => startNavigation(job)}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Start Navigation
                          </Button>
                        )}
                        <Button 
                          variant="accent" 
                          className="w-full" 
                          onClick={() => markPendingConfirmation(job.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete (Pending Confirmation)
                        </Button>
                      </>
                    )}

                    {/* Customer Actions */}
                    {profile?.role === "customer" && job.status === "pending_confirmation" && (
                      <Button 
                        variant="accent" 
                        className="w-full" 
                        onClick={() => confirmJobCompletion(job)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Job Complete & Release Payment
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
