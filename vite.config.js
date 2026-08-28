import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/MAYHEM/', 
  build: {
    outDir: 'build', 
  },
  plugins: [react()],
});