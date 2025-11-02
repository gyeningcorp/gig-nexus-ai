import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Location {
  lat: number;
  lng: number;
}

interface MapProps {
  jobLocation?: Location;
  workerLocation?: Location;
  customerLocation?: Location;
  showRoute?: boolean;
  onLocationSelect?: (location: Location) => void;
  className?: string;
  zoom?: number;
  accessToken?: string;
}

const Map = ({
  jobLocation,
  workerLocation,
  customerLocation,
  showRoute = false,
  onLocationSelect,
  className = "w-full h-[400px]",
  zoom = 13,
  accessToken
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !accessToken) return;

    const centerLocation = jobLocation || workerLocation || customerLocation || { lat: 40.7128, lng: -74.0060 };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${accessToken}`,
      center: [centerLocation.lng, centerLocation.lat],
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Handle location selection
    if (onLocationSelect) {
      map.current.on('click', (e) => {
        onLocationSelect({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        });
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [accessToken]);

  // Update job location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !jobLocation) return;

    if (markersRef.current.job) {
      markersRef.current.job.remove();
    }

    const el = document.createElement('div');
    el.className = 'job-marker';
    el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAzMCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgMEMxMCAwIDUuNSA0LjUgNS41IDEwQzUuNSAxNyAxNSAzMCAxNSAzMEMxNSAzMCAyNC41IDE3IDI0LjUgMTBDMjQuNSA0LjUgMjAgMCAxNSAwWiIgZmlsbD0iI0VGNDQ0NCIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTAiIHI9IjQiIGZpbGw9IndoaXRlIi8+PC9zdmc+)';
    el.style.width = '30px';
    el.style.height = '40px';
    el.style.backgroundSize = 'contain';
    el.style.cursor = 'pointer';

    markersRef.current.job = new maplibregl.Marker({ element: el })
      .setLngLat([jobLocation.lng, jobLocation.lat])
      .setPopup(new maplibregl.Popup().setHTML('<div class="font-semibold">Job Location</div>'))
      .addTo(map.current);

    map.current.flyTo({ center: [jobLocation.lng, jobLocation.lat], zoom: zoom });
  }, [jobLocation, mapLoaded, zoom]);

  // Update worker location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !workerLocation) return;

    if (markersRef.current.worker) {
      markersRef.current.worker.remove();
    }

    const el = document.createElement('div');
    el.className = 'worker-marker';
    el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAzMCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgMEMxMCAwIDUuNSA0LjUgNS41IDEwQzUuNSAxNyAxNSAzMCAxNSAzMEMxNSAzMCAyNC41IDE3IDI0LjUgMTBDMjQuNSA0LjUgMjAgMCAxNSAwWiIgZmlsbD0iIzIyQzU1RSIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTAiIHI9IjQiIGZpbGw9IndoaXRlIi8+PC9zdmc+)';
    el.style.width = '30px';
    el.style.height = '40px';
    el.style.backgroundSize = 'contain';

    markersRef.current.worker = new maplibregl.Marker({ element: el })
      .setLngLat([workerLocation.lng, workerLocation.lat])
      .setPopup(new maplibregl.Popup().setHTML('<div class="font-semibold">Worker Location</div>'))
      .addTo(map.current);
  }, [workerLocation, mapLoaded]);

  // Update customer location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !customerLocation) return;

    if (markersRef.current.customer) {
      markersRef.current.customer.remove();
    }

    const el = document.createElement('div');
    el.className = 'customer-marker';
    el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAzMCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgMEMxMCAwIDUuNSA0LjUgNS41IDEwQzUuNSAxNyAxNSAzMCAxNSAzMEMxNSAzMCAyNC41IDE3IDI0LjUgMTBDMjQuNSA0LjUgMjAgMCAxNSAwWiIgZmlsbD0iIzM4OTZGRiIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTAiIHI9IjQiIGZpbGw9IndoaXRlIi8+PC9zdmc+)';
    el.style.width = '30px';
    el.style.height = '40px';
    el.style.backgroundSize = 'contain';

    markersRef.current.customer = new maplibregl.Marker({ element: el })
      .setLngLat([customerLocation.lng, customerLocation.lat])
      .setPopup(new maplibregl.Popup().setHTML('<div class="font-semibold">Customer Location</div>'))
      .addTo(map.current);
  }, [customerLocation, mapLoaded]);

  // Draw route between worker and job
  useEffect(() => {
    if (!map.current || !mapLoaded || !showRoute || !workerLocation || !jobLocation) return;

    const getRoute = async () => {
      const query = await fetch(
        `https://api.maptiler.com/routing/route?point=${workerLocation.lat},${workerLocation.lng}&point=${jobLocation.lat},${jobLocation.lng}&key=${accessToken}`,
        { method: 'GET' }
      );
      const json = await query.json();
      const route = json.paths[0].points.coordinates;

      if (map.current?.getSource('route')) {
        (map.current.getSource('route') as maplibregl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route
          }
        });
      } else {
        map.current?.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route
              }
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }

      // Calculate ETA
      const duration = Math.round(json.paths[0].time / 60000);
      console.log(`ETA: ${duration} minutes`);
    };

    getRoute();
  }, [workerLocation, jobLocation, showRoute, mapLoaded]);

  return (
    <div ref={mapContainer} className={className} />
  );
};

export default Map;
