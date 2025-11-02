import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MapPin, X } from 'lucide-react';

mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtNjBvZ2JmZDA4dGgyanNjZGx5cXR1eHoifQ.8LJPzKhxqTZLqK0iI4KxAw';

interface Job {
  id: string;
  title: string;
  location: string;
  location_coordinates?: {
    lat: number;
    lng: number;
  };
  price: number;
  type: string;
}

interface AvailableJobsMapProps {
  jobs: Job[];
  onJobSelect?: (job: Job) => void;
}

const AvailableJobsMap = ({ jobs, onJobSelect }: AvailableJobsMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Center on user's location or default
    navigator.geolocation.getCurrentPosition(
      (position) => {
        initMap(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // Default to New York if geolocation fails
        initMap(40.7128, -74.006);
      }
    );
  }, []);

  const initMap = (lat: number, lng: number) => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#3b82f6';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';

    new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map.current);
  };

  // Update job markers when jobs change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for jobs with coordinates
    jobs.forEach((job) => {
      if (!job.location_coordinates) return;

      const el = document.createElement('div');
      el.className = 'job-marker cursor-pointer';
      el.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <span class="text-white text-xs font-bold">$${job.price}</span>
          </div>
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedJob(job);
        if (onJobSelect) {
          onJobSelect(job);
        }
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([job.location_coordinates.lng, job.location_coordinates.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit map to show all jobs
    if (jobs.length > 0 && jobs.some(j => j.location_coordinates)) {
      const bounds = new mapboxgl.LngLatBounds();
      jobs.forEach(job => {
        if (job.location_coordinates) {
          bounds.extend([job.location_coordinates.lng, job.location_coordinates.lat]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [jobs, onJobSelect]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[600px] rounded-lg" />
      
      {selectedJob && (
        <Card className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm z-10">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedJob.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {selectedJob.location}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedJob(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-primary">
                  ${selectedJob.price}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  {selectedJob.type}
                </span>
              </div>
              <Button onClick={() => onJobSelect?.(selectedJob)}>
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AvailableJobsMap;
