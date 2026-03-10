import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pallanuoto.verbale',
  appName: 'Verbale Pallanuoto',
  webDir: 'build',
  server: {
    // Permette connessioni HTTP (non solo HTTPS) per il WebSocket verso il Pi
    cleartext: true,
    androidScheme: 'http'
  },
  android: {
    // Permette mixed content (HTTP WebSocket)
    allowMixedContent: true
  }
};

export default config;