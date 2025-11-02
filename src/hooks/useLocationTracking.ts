import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Location {
  lat: number;
  lng: number;
  timestamp?: string;
}

export const useLocationTracking = (userId: string | undefined, shouldTrack: boolean = false) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !shouldTrack) return;

    let watchId: number;

    const startTracking = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        toast({
          title: "Location Error",
          description: "Geolocation is not supported by your browser",
          variant: "destructive",
        });
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString(),
          };

          setLocation(newLocation);

          // Update location in database
          const { error } = await supabase
            .from('profiles')
            .update({ current_location: newLocation as any })
            .eq('user_id', userId);

          if (error) {
            console.error('Error updating location:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    };

    // Request permission and start tracking
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((result) => {
        if (result.state === 'granted') {
          startTracking();
        } else if (result.state === 'prompt') {
          startTracking();
        } else {
          setError('Location permission denied');
          toast({
            title: "Permission Denied",
            description: "Please enable location access to use this feature",
            variant: "destructive",
          });
        }
      })
      .catch(() => {
        // Fallback for browsers that don't support permissions API
        startTracking();
      });

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [userId, shouldTrack, toast]);

  return { location, error };
};

export const useWorkerLocationSubscription = (workerId: string | undefined) => {
  const [workerLocation, setWorkerLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!workerId) return;

    // Fetch initial location
    const fetchLocation = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('current_location')
        .eq('user_id', workerId)
        .single();

      if (data?.current_location) {
        setWorkerLocation(data.current_location as unknown as Location);
      }
    };

    fetchLocation();

    // Subscribe to location updates
    const channel = supabase
      .channel('worker-location')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${workerId}`,
        },
        (payload) => {
          if (payload.new.current_location) {
            setWorkerLocation(payload.new.current_location as unknown as Location);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerId]);

  return workerLocation;
};
