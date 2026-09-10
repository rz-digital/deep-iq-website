import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Relative build URLs keep the site working under GitHub Pages project paths.
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cloudmon: resolve(__dirname, 'cloudmon.html'),
        miphi: resolve(__dirname, 'miphi.html'),
      },
    },
  },
});
