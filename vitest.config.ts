import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths'; // <-- Importamos el plugin

export default defineConfig({
  plugins: [tsconfigPaths()], // <-- Le decimos a Vitest que use el plugin
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});