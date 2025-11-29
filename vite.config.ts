import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Fix: Cast process to any to avoid type errors in some environments
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Define process.env.API_KEY directly for safer replacement in client code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
