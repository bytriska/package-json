import path from 'node:path'
import { PACKAGE_FILE, WORKSPACE_INDICATOR } from './constants'
import { findFile, lookupDirectories, pathExist } from './utils'

export async function findWorkspaceRoot(cwd: string): Promise<string | undefined> {
  let candidate: string | undefined
  // The lowest point (most preferred) workspace type we've found so far
  let lowestPoint: number = Object.keys(WORKSPACE_INDICATOR).length + 1

  for (const testPath of lookupDirectories(path.normalize(path.resolve(cwd)))) {
    // If we find a .git directory, stop searching upwards
    if (await pathExist(path.join(testPath, '.git', 'config'), 'file')) {
      candidate ||= testPath
      break
    }

    for (const [point, indicatorFile] of WORKSPACE_INDICATOR.entries()) {
      if (point >= lowestPoint)
        continue

      const foundIndicator = await findFile(indicatorFile, { dir: testPath })

      if (foundIndicator) {
        candidate = testPath
        lowestPoint = point
        break
      }
    }
  }

  return candidate
}

export async function findProjectRoot(cwd: string): Promise<string | null> {
  for (const testPath of lookupDirectories(path.resolve(path.normalize(cwd)))) {
    if (await pathExist(path.join(testPath, '.git', 'config'), 'file'))
      return testPath

    if (await findFile(PACKAGE_FILE, { dir: testPath }))
      return testPath
  }

  return null
}

export async function findPackageFile(cwd: string): Promise<string | null> {
  for (const testPath of lookupDirectories(path.resolve(path.normalize(cwd)))) {
    const found = await findFile(PACKAGE_FILE, { dir: testPath })

    if (found)
      return found

    if (await pathExist(path.join(testPath, '.git', 'config'), 'file'))
      break
  }

  return null
}
