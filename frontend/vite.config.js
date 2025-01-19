import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/engine-rest': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
