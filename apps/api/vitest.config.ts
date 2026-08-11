import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    fileParallelism: false,
    hookTimeout: 60000,
    testTimeout: 60000,
    setupFiles: ['src/tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@woonwork/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
});
