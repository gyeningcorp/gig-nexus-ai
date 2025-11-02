import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

export const useCapacitor = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let appStateListener: any;
    let backButtonListener: any;

    // Configure status bar
    const setupStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
      } catch (error) {
        console.log('Status bar configuration not available');
      }
    };

    // Handle app state changes
    const setupListeners = async () => {
      appStateListener = await App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active:', isActive);
      });

      // Handle back button on Android
      backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
    };

    // Configure keyboard
    const setupKeyboard = async () => {
      try {
        await Keyboard.setAccessoryBarVisible({ isVisible: true });
      } catch (error) {
        console.log('Keyboard configuration not available');
      }
    };

    setupStatusBar();
    setupKeyboard();
    setupListeners();

    return () => {
      if (appStateListener) appStateListener.remove();
      if (backButtonListener) backButtonListener.remove();
    };
  }, []);
};
