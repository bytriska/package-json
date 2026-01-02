/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'unit',
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      enabled: true,
      provider: 'v8',
    },
  },
})
