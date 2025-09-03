import fsp from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

export async function createTempDir(): Promise<string> {
  return fsp.mkdtemp(path.join(tmpdir(), 'package-json.test-'))
}

export function fixture(...p: string[]): string {
  return path.join(path.dirname(import.meta.filename), '..', 'fixture', ...p)
}
