import { useEffect, useState } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Location {
  lat: number;
  lng: number;
  timestamp?: string;
}

export const useNativeGeolocation = (userId: string | undefined, shouldTrack: boolean = false) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!userId || !shouldTrack) return;

    let watchId: string | undefined;

    const startTracking = async () => {
      try {
        // Request permissions first
        const permission = await Geolocation.requestPermissions();
        
        if (permission.location !== 'granted') {
          setError('Location permission denied');
          toast({
            title: "Permission Denied",
            description: "Please enable location access to use this feature",
            variant: "destructive",
          });
          return;
        }

        // Start watching position
        watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
          async (position: Position | null, err) => {
            if (err) {
              console.error('Geolocation error:', err);
              setError(err.message);
              return;
            }

            if (position) {
              const newLocation: Location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp: new Date(position.timestamp).toISOString(),
              };

              setLocation(newLocation);

              // Update location in database
              const { error: dbError } = await supabase
                .from('profiles')
                .update({ current_location: newLocation as any })
                .eq('user_id', userId);

              if (dbError) {
                console.error('Error updating location:', dbError);
              }
            }
          }
        );
      } catch (err: any) {
        console.error('Failed to start tracking:', err);
        setError(err.message);
        toast({
          title: "Location Error",
          description: err.message || "Failed to access location",
          variant: "destructive",
        });
      }
    };

    startTracking();

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, [userId, shouldTrack, toast, isNative]);

  return { location, error };
};
