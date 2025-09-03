import fsp from 'node:fs/promises'
import path from 'node:path'
import { PACKAGE_FILE, WORKSPACE_FILE } from './constants'
import { findFile, lookupDirectories, pathExist } from './utils'

async function hasFile(filename: string | string[], dir: string): Promise<boolean> {
  const found = await findFile(filename, { dir })

  return !!found
}

async function hasFileWithKey(
  filename: string | string[],
  key: string,
  dir: string,
): Promise<boolean> {
  const foundFile = await findFile(filename, { dir })

  if (!foundFile)
    return false

  switch (path.extname(foundFile)) {
    case '.json': {
      const blob = await fsp.readFile(foundFile, 'utf-8')
      const content = JSON.parse(blob)

      return !!content[key]
    }

    // TODO: support more file types
    default:
      return false
  }
}

type WorkspaceCriteria = (testPath: string) => Promise<boolean>

const WORKSPACE_CRITERIA: WorkspaceCriteria[] = [
  async (testPath: string) => await hasFile(WORKSPACE_FILE, testPath),
  async (testPath: string) => await hasFileWithKey(PACKAGE_FILE, 'workspaces', testPath),
  async (testPath: string) => await hasFile(PACKAGE_FILE, testPath),
]

export async function findWorkspaceRoot(cwd: string): Promise<string | undefined> {
  let candidate: string | undefined
  // The lowest point (most preferred) workspace type we've found so far
  let lowestPoint: number = WORKSPACE_CRITERIA.length + 1

  for (const testPath of lookupDirectories(path.normalize(path.resolve(cwd)))) {
    // If we find a .git directory, stop searching upwards
    if (await pathExist(path.join(testPath, '.git', 'config'), 'file')) {
      candidate ||= testPath
      break
    }

    for (const [point, criteriaFn] of WORKSPACE_CRITERIA.entries()) {
      if (point >= lowestPoint)
        continue

      const foundIndicator = await criteriaFn(testPath)

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
