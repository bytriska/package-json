import path from 'node:path'
import { KNOWN_WORKSPACE, PACKAGE_FILES } from './constants'
import { findFile, lookupDirectories, pathExist } from './utils'

export async function findWorkspaceRoot(cwd: string): Promise<string | null> {
  let candidate: string = ''
  // The lowest point (most preferred) workspace type we've found so far
  let lowestPoint: number = Object.keys(KNOWN_WORKSPACE).length + 1

  for (const testPath of lookupDirectories(path.resolve(path.normalize(cwd)))) {
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

export async function findProjectRoot(cwd: string): Promise<string | null> {
  for (const testPath of lookupDirectories(path.resolve(path.normalize(cwd)))) {
    if (await pathExist(path.join(testPath, '.git', 'config'), 'file'))
      return testPath

    if (await findFile(PACKAGE_FILES, { dir: testPath }))
      return testPath
  }

  return null
}
