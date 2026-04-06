import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a9145cfdcc224810993508180245d526',
  appName: 'NOIR925',
  webDir: 'dist',
  server: {
    url: 'https://a9145cfd-cc22-4810-9935-08180245d526.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1E1E1E',
      showSpinner: true,
      spinnerColor: '#D4AF37',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1E1E1E',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
