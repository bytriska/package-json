import fs from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { findPackageFile, findProjectRoot, findWorkspaceRoot } from '../src'
import { WORKSPACE_INDICATOR } from '../src/constants'
import { createTempDir, fixture } from './utils'

describe('findWorkspaceRoot', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('should find the workspace root for all known workspace types', async () => {
    for (const indicatorFile of WORKSPACE_INDICATOR) {
      const subDir = path.join(tempDir, 'packages', 'package-a')

      await fs.cp(fixture('example-repo'), tempDir, { recursive: true })
      await fs.writeFile(path.join(tempDir, indicatorFile[0]), '')
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

    expect(await findWorkspaceRoot(subDir)).toBeUndefined()
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
