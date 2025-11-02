import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = (userId: string | undefined) => {
  const { toast } = useToast();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!userId || !isNative) return;

    const setupPushNotifications = async () => {
      try {
        // Request permission
        const permission = await PushNotifications.requestPermissions();
        
        if (permission.receive !== 'granted') {
          console.log('Push notification permission denied');
          return;
        }

        // Register with APNs / FCM
        await PushNotifications.register();

        // Handle registration
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token:', token.value);
          // Token saved - can be stored in database when types are updated
        });

        // Handle registration error
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error:', error);
        });

        // Handle push notification received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received:', notification);
          toast({
            title: notification.title || 'New Notification',
            description: notification.body,
          });
        });

        // Handle notification tapped
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed:', notification);
          // Handle deep linking or navigation based on notification data
        });
      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    setupPushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [userId, isNative, toast]);
};
