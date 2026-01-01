import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', 
  build: {
    outDir: 'dist',
    target: 'esnext', // આધુનિક મોબાઈલ માટે esnext સારું છે
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      // બિનજરૂરી external અને Node.js ની વસ્તુઓ કાઢી નાખી છે
    }
  }
});