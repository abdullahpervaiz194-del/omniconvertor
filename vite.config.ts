import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

const fallbackFirebaseConfig = {
  projectId: "wired-ascent-7q6d2",
  appId: "1:607919226905:web:8d18b2090cf187b7cb6a88",
  apiKey: "AIzaSyDHdWOxdJcV1FzEIIZw34_gLEiuu1ID5s8",
  authDomain: "wired-ascent-7q6d2.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-allinoneconverte-77eba0d6-bca9-4098-8ba5-147ad1e884d9",
  storageBucket: "wired-ascent-7q6d2.firebasestorage.app",
  messagingSenderId: "607919226905",
  measurementId: "",
  oAuthClientId: "607919226905-g8i709s980fcgrd5hcep08ajtjbge9oq.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'firebase-applet-config-resolver',
        resolveId(id) {
          if (id.includes('firebase-applet-config.json')) {
            const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
            if (fs.existsSync(configPath)) {
              return configPath;
            }
            return '\0virtual:firebase-applet-config.json';
          }
        },
        load(id) {
          if (id === '\0virtual:firebase-applet-config.json') {
            return `export default ${JSON.stringify(fallbackFirebaseConfig)};`;
          }
        }
      },
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
