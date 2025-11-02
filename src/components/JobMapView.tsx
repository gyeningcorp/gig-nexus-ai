import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Map from './Map';
import { useWorkerLocationSubscription } from '@/hooks/useLocationTracking';
import { Badge } from './ui/badge';
import { MapPin, Navigation } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface JobMapViewProps {
  jobLocation?: Location;
  workerId?: string;
  customerId?: string;
  jobTitle: string;
  showRoute?: boolean;
}

const JobMapView = ({ 
  jobLocation, 
  workerId, 
  customerId, 
  jobTitle,
  showRoute = false 
}: JobMapViewProps) => {
  const workerLocation = useWorkerLocationSubscription(workerId);

  // Calculate distance (simple Haversine formula)
  const calculateDistance = (loc1: Location, loc2: Location) => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
  };

  const distance = jobLocation && workerLocation 
    ? calculateDistance(jobLocation, workerLocation)
    : null;

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {jobTitle}
          </CardTitle>
          {distance && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {distance} km away
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Map
          jobLocation={jobLocation}
          workerLocation={workerLocation || undefined}
          showRoute={showRoute && !!workerLocation}
          className="w-full h-[400px] rounded-lg"
        />
        {workerLocation && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            Worker location updating in real-time
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobMapView;
