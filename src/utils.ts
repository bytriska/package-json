import type { FindFileOptions, ThrowableOptions } from './types'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function findFile(
  file: string | string[],
  options: FindFileOptions & ThrowableOptions,
): Promise<string | null> {
  const arrayFiles = Array.isArray(file) ? file : [file]
  const isTry = options.try ?? true // default to true

  for (const f of arrayFiles) {
    const filepath = path.join(path.resolve(options.dir), f)

    if (!(await pathExist(filepath, 'file')))
      continue
    if (options.test && !(await options.test(filepath)))
      continue

    return filepath
  }

  if (!isTry)
    throw new Error('None of the specified files were found.')

  return null
}

export function* lookupDirectories(startDir: string): Generator<string> {
  let currentDir = path.resolve(startDir)
  const parsedDir = path.parse(currentDir)

  while (currentDir && currentDir !== parsedDir.root) {
    yield currentDir

    currentDir = path.dirname(currentDir)
  }
}

export async function pathExist(path: string, type: 'file' | 'dir'): Promise<boolean> {
  try {
    const stat = await fs.stat(path)
    return type === 'file' ? stat.isFile() : stat.isDirectory()
  }
  catch {
    return false
  }
}
