import type { FindFileOptions } from './types'
import fs from 'node:fs/promises'
import path from 'node:path'
import { KNOWN_WORKSPACE } from './constants'

export async function findWorkspaceRoot(cwd: string): Promise<string | null> {
  let candidate: string = ''
  // The lowest point (most preferred) workspace type we've found so far
  let lowestPoint: number = Object.keys(KNOWN_WORKSPACE).length + 1

  for (const testPath of lookupDirectories(path.resolve(cwd))) {
    // If we find a .git directory, stop searching upwards
    if (await pathExist(path.join(testPath, '.git', 'config'), 'file')) {
      candidate ||= testPath
      break
    }

    const workspaceNames = Object.keys(KNOWN_WORKSPACE)
    for (const [point, workspaceName] of workspaceNames.entries()) {
      if (point >= lowestPoint)
        continue

      const workspace = KNOWN_WORKSPACE[workspaceName]
      const workspaceFile = await findFile(workspace.files, { dir: testPath, test: workspace.test })

      if (workspaceFile) {
        candidate = testPath
        lowestPoint = point
        break
      }
    }
  }

  return candidate || null
}

export async function findFile(
  file: string | string[],
  { dir, test }: FindFileOptions,
): Promise<string | null> {
  const arrayFiles = Array.isArray(file) ? file : [file]

  for (const f of arrayFiles) {
    const filepath = path.join(path.resolve(dir), f)

    if (!(await pathExist(filepath, 'file')))
      continue
    if (test && !(await test(filepath)))
      continue

    return filepath
  }

  return null
}

function* lookupDirectories(startDir: string): Generator<string> {
  let currentDir = path.resolve(startDir)
  const parsedDir = path.parse(currentDir)

  while (currentDir && currentDir !== parsedDir.root) {
    yield currentDir

    currentDir = path.dirname(currentDir)
  }
}

async function pathExist(path: string, type: 'file' | 'dir'): Promise<boolean> {
  try {
    const stat = await fs.stat(path)
    return type === 'file' ? stat.isFile() : stat.isDirectory()
  }
  catch {
    return false
  }
}
