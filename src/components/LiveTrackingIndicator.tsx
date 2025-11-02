import { Badge } from "./ui/badge";
import { Activity, MapPin } from "lucide-react";

interface LiveTrackingIndicatorProps {
  isTracking: boolean;
  label?: string;
}

const LiveTrackingIndicator = ({ isTracking, label = "Live Tracking" }: LiveTrackingIndicatorProps) => {
  if (!isTracking) return null;

  return (
    <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border-green-500/20">
      <div className="relative flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <Activity className="w-3.5 h-3.5 text-green-500" />
      </div>
      <span className="text-xs font-medium text-green-600 dark:text-green-400">{label}</span>
      <MapPin className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
    </Badge>
  );
};

export default LiveTrackingIndicator;
