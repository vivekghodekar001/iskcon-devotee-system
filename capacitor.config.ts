import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.iskcon.portal',
    appName: 'Gita Life',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
