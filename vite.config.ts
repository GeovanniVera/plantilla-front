/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Internal path aliases (mirrored in tsconfig.app.json compilerOptions.paths).
// Storybook's Vite builder reads this file automatically, so no viteFinal is needed.
const aliases = {
  '@components': path.resolve(dirname, 'src/components'),
  '@hooks': path.resolve(dirname, 'src/hooks'),
  '@theme': path.resolve(dirname, 'src/theme'),
  '@dev': path.resolve(dirname, 'src/dev'),
};

// More info at: https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: aliases,
  },
  test: {
    projects: [{
      extends: true,
      test: {
        name: 'unit',
        include: ['src/**/*.test.ts'],
        environment: 'node',
      },
    },
    {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});