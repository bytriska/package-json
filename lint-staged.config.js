export default {
  '*.{ts,tsx}': ['pnpm lint:prettier', 'pnpm lint:eslint', 'pnpm test:types'],
  '*.{js,json,yml,yaml,md,html,css}': ['pnpm lint:prettier', 'pnpm lint:eslint'],
}
