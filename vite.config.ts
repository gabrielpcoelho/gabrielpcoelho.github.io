import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    rollupOptions: { input: { main: resolve(import.meta.dirname, 'index.html'), qr: resolve(import.meta.dirname, 'qr/index.html') } },
  },
});
