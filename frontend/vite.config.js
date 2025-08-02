// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // <--- THIS IS CRUCIAL FOR TAILWIND V4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
  ],
 
});