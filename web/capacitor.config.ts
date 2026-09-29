import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.asperiondigitaltechnologies.yuktiprep',
  appName: 'Yuktiprep',
  webDir: 'out',
  server: {
    cleartext: true,
    allowNavigation: ['ba.yuktiprep.com', '*.yuktiprep.com']
  }
};

export default config;