import fs from 'node:fs/promises'
import path from 'node:path'

export interface FindFileOptions {
  dir: string
}

export async function findFile(
  file: string | string[],
  options: FindFileOptions,
): Promise<string | null> {
  const arrayFiles = Array.isArray(file) ? file : [file]

  for (const f of arrayFiles) {
    const filepath = path.join(path.resolve(options.dir), f)

    if (await pathExist(filepath, 'file'))
      return filepath
  }

  return null
}

export function* lookupDirectories(dir: string): Generator<string> {
  let currentDir = path.resolve(dir)

  while (currentDir && currentDir !== path.parse(currentDir).root) {
    yield currentDir

    currentDir = path.dirname(currentDir)
  }
}

export async function pathExist(path: string, type: 'file' | 'dir'): Promise<boolean> {
  try {
    const stat = await fs.stat(path)
    return type === 'file' ? stat.isFile() : stat.isDirectory()
  }
  catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT')
      throw err

    return false
  }
}
