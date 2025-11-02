// Simulated GPS utility for testing route navigation without live API
// Generates realistic intermediate points between worker and job location

type Location = {
  lat: number;
  lng: number;
};

export class SimulatedGPS {
  private currentIndex: number = 0;
  private routePoints: Location[] = [];
  private intervalId: number | null = null;
  private onUpdate: (location: Location, progress: number) => void;

  constructor(
    start: Location,
    end: Location,
    onUpdate: (location: Location, progress: number) => void
  ) {
    this.onUpdate = onUpdate;
    this.routePoints = this.generateRoutePoints(start, end);
  }

  private generateRoutePoints(start: Location, end: Location): Location[] {
    const points: Location[] = [start];
    const steps = 20; // Number of intermediate points
    
    for (let i = 1; i <= steps; i++) {
      const ratio = i / (steps + 1);
      
      // Add some randomness to simulate realistic GPS path (not perfectly straight)
      const randomOffsetLat = (Math.random() - 0.5) * 0.001;
      const randomOffsetLng = (Math.random() - 0.5) * 0.001;
      
      points.push({
        lat: start.lat + (end.lat - start.lat) * ratio + randomOffsetLat,
        lng: start.lng + (end.lng - start.lng) * ratio + randomOffsetLng,
      });
    }
    
    points.push(end);
    return points;
  }

  start(intervalMs: number = 3000) {
    if (this.intervalId) return; // Already running
    
    this.intervalId = window.setInterval(() => {
      if (this.currentIndex < this.routePoints.length) {
        const currentLocation = this.routePoints[this.currentIndex];
        const progress = (this.currentIndex / (this.routePoints.length - 1)) * 100;
        
        this.onUpdate(currentLocation, progress);
        this.currentIndex++;
      } else {
        this.stop();
      }
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.stop();
    this.currentIndex = 0;
  }

  getCurrentLocation(): Location | null {
    return this.routePoints[this.currentIndex] || null;
  }

  getProgress(): number {
    return (this.currentIndex / (this.routePoints.length - 1)) * 100;
  }
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

// Estimate travel time based on distance (assuming average speed of 40 km/h)
export function estimateTravelTime(distanceKm: number): number {
  const averageSpeedKmh = 40;
  return (distanceKm / averageSpeedKmh) * 60; // Return minutes
}
