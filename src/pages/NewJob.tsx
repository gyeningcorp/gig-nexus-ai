import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/Map";
import { MapPin } from "lucide-react";
import MaptilerTokenInput from "@/components/MaptilerTokenInput";

const NewJob = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    type: "",
    location: "",
    scheduled_time: "",
  });
  const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('mapbox_token');
    if (stored) {
      setMapboxToken(stored);
    }
  }, []);

  // Geocode address to coordinates using MapTiler API
  const geocodeAddress = async (address: string) => {
    if (!address || !mapboxToken) return;
    
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${mapboxToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setLocationCoordinates({ lat, lng });
        setShowMap(true);
        toast({
          title: "Location Found",
          description: `Pinned to: ${data.features[0].place_name}`,
        });
      } else {
        toast({
          title: "Location Not Found",
          description: "Please try a different address or pin manually on the map",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Geocoding Failed",
        description: "Please pin location manually on the map",
        variant: "destructive"
      });
    } finally {
      setGeocoding(false);
    }
  };

  // Auto-geocode when location is entered (with debounce)
  useEffect(() => {
    if (!formData.location || !mapboxToken) return;
    
    const timer = setTimeout(() => {
      geocodeAddress(formData.location);
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timer);
  }, [formData.location, mapboxToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate location coordinates are set
    if (!locationCoordinates) {
      toast({
        title: "Location Required",
        description: "Please wait for automatic geocoding or pin the location on the map",
        variant: "destructive"
      });
      setLoading(false);
      setShowMap(true);
      return;
    }

    const price = parseFloat(formData.price);

    if (profile && profile.wallet_balance < price) {
      toast({
        title: "Insufficient Funds",
        description: "Please add funds to your wallet first",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const { error: jobError } = await supabase.from("jobs").insert({
      ...formData,
      price,
      customer_id: user?.id,
      scheduled_time: formData.scheduled_time || null,
      location_coordinates: locationCoordinates as any,
    });

    if (jobError) {
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      });
    } else {
      // Deduct from wallet
      await supabase
        .from("profiles")
        .update({ wallet_balance: profile!.wallet_balance - price })
        .eq("user_id", user?.id);

      toast({
        title: "Job Posted!",
        description: "Your job has been posted successfully"
      });
      navigate("/my-jobs");
    }

    setLoading(false);
  };

  return (
    <ProtectedRoute requireRole="customer">
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Service Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rideshare">Rideshare</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="home_service">Home Service</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="pet_care">Pet Care</SelectItem>
                      <SelectItem value="errand">Errand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location Address</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter full address (e.g., 123 Main St, New York, NY)"
                      required
                    />
                    {geocoding && (
                      <p className="text-sm text-muted-foreground animate-pulse">
                        🔍 Finding location...
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      Map Location 
                      {locationCoordinates ? (
                        <span className="text-green-500">✓ Set</span>
                      ) : (
                        <span className="text-yellow-500">⚠ Required</span>
                      )}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMap(!showMap)}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {showMap ? "Hide Map" : "Show Map"}
                    </Button>
                  </div>
                  
                  {!mapboxToken && (
                    <Alert className="bg-blue-500/10 border-blue-500/20">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <AlertTitle className="text-blue-500">MapTiler Token Required</AlertTitle>
                      <AlertDescription className="text-blue-500/80">
                        Enter your MapTiler token below to enable automatic geocoding and map pinning
                      </AlertDescription>
                    </Alert>
                  )}

                  <MaptilerTokenInput onTokenSet={setMapboxToken} />
                  
                  {showMap && mapboxToken && (
                    <div className="border rounded-lg overflow-hidden">
                      <Map
                        jobLocation={locationCoordinates || undefined}
                        onLocationSelect={(location) => {
                          setLocationCoordinates(location);
                          toast({
                            title: "Location Manually Set",
                            description: `Coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
                          });
                        }}
                        className="w-full h-[300px]"
                        accessToken={mapboxToken}
                      />
                    </div>
                  )}
                  
                  {locationCoordinates && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✓ Location pinned: {locationCoordinates.lat.toFixed(4)}, {locationCoordinates.lng.toFixed(4)}
                    </p>
                  )}
                  
                  {!locationCoordinates && mapboxToken && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      ⚠ Enter an address above for automatic location, or click on the map to pin manually
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_time">Schedule (Optional)</Label>
                  <Input
                    id="scheduled_time"
                    type="datetime-local"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  />
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Posting..." : "Post Job"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default NewJob;
