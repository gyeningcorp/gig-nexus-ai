import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.64b9200b3298414480842497ab9942ce',
  appName: 'GoGig',
  webDir: 'dist',
  server: {
    url: 'https://64b9200b-3298-4144-8084-2497ab9942ce.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Geolocation: {
      requestPermissions: true,
    },
  },
};

export default config;
