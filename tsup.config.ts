import { defineConfig } from 'tsup'

export default defineConfig({
  target: 'node16',
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  shims: true,
  sourcemap: true,
  minify: true,
})
