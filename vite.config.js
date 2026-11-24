import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    port: 5000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: [
            'firebase/app',
            'firebase/analytics',
            'firebase/auth',
            'firebase/firestore',
            'firebase/database',
            'firebase/storage',
            'firebase/functions',
          ],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
