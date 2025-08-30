import type { WorkspaceTest } from './types'

export const PACKAGE_FILES = ['package.json', 'package.json5', 'package.yaml']

export const KNOWN_WORKSPACE: Record<string, WorkspaceTest> = {
  turbo: { files: ['turbo.json'] },
  nx: { files: ['nx.json'] },
  pnpm: { files: ['pnpm-workspace.yaml'] },
  lerna: { files: ['lerna.json'] },
  singleRepo: { files: PACKAGE_FILES },
}
