import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "./ui/badge";
import { Wifi, WifiOff } from "lucide-react";

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Monitor Supabase realtime connection status
    const channel = supabase.channel('connection-monitor');
    
    channel
      .on('system', {}, (payload) => {
        if (payload.extension === 'postgres_changes') {
          setIsConnected(payload.status === 'ok');
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Also monitor online/offline events
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isConnected) {
    return (
      <Badge variant="outline" className="gap-2 border-green-500/30 bg-green-500/10 text-green-600">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <Wifi className="w-3 h-3" />
        Live
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-2 border-red-500/30 bg-red-500/10 text-red-600">
      <WifiOff className="w-3 h-3" />
      Reconnecting...
    </Badge>
  );
};

export default ConnectionStatus;
