import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Fix: Cast process to any because type definition for 'process' might be missing 'cwd' in some environments.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Define process.env so that code using process.env.API_KEY works in the browser
      'process.env': {
        API_KEY: env.API_KEY
      }
    }
  };
});
