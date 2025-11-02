import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Map from './Map';
import { useWorkerLocationSubscription } from '@/hooks/useLocationTracking';
import { Badge } from './ui/badge';
import { MapPin, Navigation } from 'lucide-react';
import LiveTrackingIndicator from './LiveTrackingIndicator';

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
  isHighlighted?: boolean;
}

const JobMapView = ({ 
  jobLocation, 
  workerId, 
  customerId, 
  jobTitle,
  showRoute = false,
  isHighlighted = false
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
    <Card className={`bg-card/50 backdrop-blur-sm transition-all duration-300 ${
      isHighlighted ? 'ring-4 ring-green-500/50 animate-pulse' : ''
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {jobTitle}
          </CardTitle>
          <div className="flex items-center gap-2">
            {distance && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                {distance} km away
              </Badge>
            )}
            <LiveTrackingIndicator isTracking={!!workerLocation} />
          </div>
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
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-green-600 dark:text-green-400">
                Worker location updating in real-time
              </span>
            </div>
            {distance && (
              <p className="text-xs text-muted-foreground mt-1 ml-5">
                Distance: {distance} km • ETA: {Math.ceil(parseFloat(distance) * 3)} min
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobMapView;
