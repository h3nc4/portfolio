/// <reference types="vitest/config" />

import { getViteConfig } from 'astro/config'

// Through Astro's own Vite config, so a test can render a component with the container API.
export default getViteConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/test/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      reportOnFailure: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/scripts/main.ts',
        'src/components/ui',
        'src/test/**',
        '**/*.test.ts',
        '**/*.d.ts',
      ],
    },
  },
})
