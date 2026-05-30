import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths({ root: process.cwd() })],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/app/core'),
      '@config': path.resolve(__dirname, 'src/app/core/config'),
      '@guards': path.resolve(__dirname, 'src/app/core/guards'),
      '@interceptors': path.resolve(__dirname, 'src/app/core/interceptors'),
      '@services': path.resolve(__dirname, 'src/app/core/services'),
      '@features': path.resolve(__dirname, 'src/app/features'),
      '@web': path.resolve(__dirname, 'src/app/features/web'),
      '@info': path.resolve(__dirname, 'src/app/features/info'),
      '@admin': path.resolve(__dirname, 'src/app/features/admin'),
      '@auth': path.resolve(__dirname, 'src/app/features/auth'),
      '@play': path.resolve(__dirname, 'src/app/features/play'),
      '@settings': path.resolve(__dirname, 'src/app/features/settings'),
      '@models': path.resolve(__dirname, 'src/app/shared/models'),
      '@shared': path.resolve(__dirname, 'src/app/shared'),
      '@ui': path.resolve(__dirname, 'src/app/shared/ui'),
      '@pipes': path.resolve(__dirname, 'src/app/shared/pipes'),
      '@env': path.resolve(__dirname, 'src/environments'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
