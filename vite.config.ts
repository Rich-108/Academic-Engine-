import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Essential for Vercel: ensures assets are loaded from the root
  base: '/',
  resolve: {
    alias: {
      // This matches the '@' alias you had before, pointing to the src folder
      '@': path.resolve(__dirname, './src'),
    },
  },
  // This allows the app to handle "process.env" calls without crashing
  define: {
    'process.env': {},
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  }
});
