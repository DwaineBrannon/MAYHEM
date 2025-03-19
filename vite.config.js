import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/MAYHEM/', // Replace 'MAYHEM' with your repository name
  build: {
    outDir: 'build', // Change output directory to 'build'
  },
  plugins: [react()],
});