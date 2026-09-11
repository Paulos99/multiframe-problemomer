import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project Pages: https://paulos99.github.io/multiframe-problemomer/
export default defineConfig({
  base: '/multiframe-problemomer/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
