import type { Buffer } from 'node:buffer'
import fsp from 'node:fs/promises'
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
    const stat = await fsp.stat(path)
    return type === 'file' ? stat.isFile() : stat.isDirectory()
  }
  catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT')
      throw err

    return false
  }
}

export async function writeFileAtomic(filepath: string, data: string | Buffer): Promise<void> {
  const dir = path.dirname(filepath)
  const tempfile = path.join(
    dir,
    ''.concat('.', path.basename(filepath), '-', Math.random().toString(16).slice(2), '.tmp'),
  )

  await fsp.mkdir(dir, { recursive: true })
  await fsp.writeFile(tempfile, data)
  await fsp.rename(tempfile, filepath)
}
