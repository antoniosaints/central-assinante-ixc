import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Proxy opcional: o frontend fala com o backend em /api.
    proxy: {
      '/api': {
        target: 'http://192.168.6.141:3333',
        changeOrigin: true,
      },
    },
  },
});
