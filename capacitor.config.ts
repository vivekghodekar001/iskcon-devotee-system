import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.iskcon.portal',
    appName: 'ISKCON Portal',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
