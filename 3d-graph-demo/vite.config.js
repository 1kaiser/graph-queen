import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/graph-queen/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
}));
