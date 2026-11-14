/*
 * Copyright (C) 2026  Henrique Almeida
 * This file is part of Portfolio.
 *
 * Portfolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Portfolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Portfolio.  If not, see <https://www.gnu.org/licenses/>.
 */

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
