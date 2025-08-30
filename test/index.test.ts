import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { findPackageFile, findProjectRoot, findWorkspaceRoot } from '../src'
import { KNOWN_WORKSPACE } from '../src/constants'
import { findFile } from '../src/utils'

async function createTempDir(): Promise<string> {
  const directory = await fs.mkdtemp(path.join(tmpdir(), 'package-json.test-'))

  return directory
}

const fixture = (...p: string[]) => path.join(path.dirname(import.meta.filename), 'fixture', ...p)

describe('findFile', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('should find a file that exists', async () => {
    const filepath = path.join(tempDir, 'file.txt')
    await fs.writeFile(filepath, 'example content')

    expect(await findFile('file.txt', { dir: tempDir })).toBe(filepath)
    expect(await findFile(['nonexistent.txt', 'file.txt'], { dir: tempDir })).toBe(filepath)
  })

  it('should return null for a file that does not exist', async () => {
    expect(await findFile('nonexistent.txt', { dir: tempDir })).toBeNull()
  })
})

describe('findWorkspaceRoot', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('should find the workspace root for all known workspace types', async () => {
    for (const workspaceNames of Object.keys(KNOWN_WORKSPACE)) {
      const workspaceFile = KNOWN_WORKSPACE[workspaceNames].files[0]
      const subDir = path.join(tempDir, 'packages', 'package-a')

      await fs.cp(fixture('example-repo'), tempDir, { recursive: true })
      await fs.writeFile(path.join(tempDir, workspaceFile), '')
      await fs.mkdir(subDir, { recursive: true })

      expect(await findWorkspaceRoot(subDir)).toBe(tempDir)
    }
  })

  it('should stop when finding a .git directory', async () => {
    const subDir = path.join(tempDir, 'packages', 'package-a')
    const gitDir = path.join(tempDir, '.git')

    await fs.cp(fixture('_git'), gitDir, { recursive: true })
    await fs.mkdir(subDir, { recursive: true })

    expect(await findWorkspaceRoot(subDir)).toBe(tempDir)
  })

  it('should return null when no workspace root is found', async () => {
    const subDir = path.join(tempDir, 'packages', 'package-a')

    await fs.mkdir(subDir, { recursive: true })

    expect(await findWorkspaceRoot(subDir)).toBeNull()
  })
})

describe('findProjectRoot', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('should find the project root by package file', async () => {
    const subDir = path.join(tempDir, 'src')

    await fs.cp(fixture('example-repo'), tempDir, { recursive: true })
    await fs.mkdir(subDir, { recursive: true })

    expect(await findProjectRoot(subDir)).toBe(tempDir)
  })

  it('should return the project root if a .git directory is found', async () => {
    const subDir = path.join(tempDir, 'src')
    const gitDir = path.join(tempDir, '.git')

    await fs.cp(fixture('_git'), gitDir, { recursive: true })
    await fs.mkdir(subDir, { recursive: true })

    expect(await findProjectRoot(subDir)).toBe(tempDir)
  })

  it('should work in a monorepo project', async () => {
    const projectDir = path.join(tempDir, 'packages', 'package-a')
    const projectSubDir = path.join(projectDir, 'src')

    await fs.cp(fixture('example-repo'), tempDir, { recursive: true })
    await fs.mkdir(projectSubDir, { recursive: true })
    await fs.cp(fixture('example-repo'), projectDir, { recursive: true })

    expect(await findProjectRoot(projectSubDir)).toBe(projectDir)
  })

  it('should return null when no condition is met', async () => {
    const subDir = path.join(tempDir, 'src')

    await fs.mkdir(subDir, { recursive: true })

    expect(await findProjectRoot(subDir)).toBeNull()
  })
})

describe('findPackageFile', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('should find the nearest package file', async () => {
    const projectDir = path.join(tempDir, 'packages', 'package-a')
    const projectSubDir = path.join(projectDir, 'src')

    await fs.cp(fixture('example-repo'), tempDir, { recursive: true })
    await fs.mkdir(projectSubDir, { recursive: true })
    await fs.cp(fixture('example-repo'), projectDir, { recursive: true })

    expect(await findPackageFile(projectSubDir)).toBe(path.join(projectDir, 'package.json'))
  })

  it('should stop when finding a .git directory', async () => {
    const subDir = path.join(tempDir, 'packages', 'package-a')
    const gitDir = path.join(tempDir, '.git')

    await fs.cp(fixture('_git'), gitDir, { recursive: true })
    await fs.mkdir(subDir, { recursive: true })

    expect(await findPackageFile(subDir)).toBeNull()
  })

  it('should return null when no package file is found', async () => {
    const subDir = path.join(tempDir, 'src')

    await fs.mkdir(subDir, { recursive: true })

    expect(await findPackageFile(subDir)).toBeNull()
  })

  it('should throw an error when no package file is found and try is false', async () => {
    const subDir = path.join(tempDir, 'src')

    await fs.mkdir(subDir, { recursive: true })

    await expect(findPackageFile(subDir, { try: false })).rejects.toThrow('No package file found.')
  })
})
