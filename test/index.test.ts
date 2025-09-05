import fsp from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { findPackageFile, findProjectRoot, findWorkspaceRoot } from '../src'
import { PACKAGE_FILE, WORKSPACE_FILE } from '../src/constants'
import { createTempDir, fixture } from './utils'

describe('findWorkspaceRoot', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true })
  })

  it('should return the path when workspace file found', async () => {
    const subDir = path.join(tempDir, 'packages', 'package-a')

    await fsp.cp(fixture('example-repo'), tempDir, { recursive: true })
    await fsp.writeFile(path.join(tempDir, WORKSPACE_FILE[0]), '')
    await fsp.mkdir(subDir, { recursive: true })

    expect(await findWorkspaceRoot(subDir)).toBe(tempDir)
  })

  it('should return the path when workspace key found in package file', async () => {
    const subDir = path.join(tempDir, 'packages', 'package-a')

    await fsp.cp(fixture('example-repo'), tempDir, { recursive: true })
    await fsp.mkdir(subDir, { recursive: true })

    const packagePath = path.join(tempDir, PACKAGE_FILE[0])
    const packageBlob = await fsp.readFile(packagePath, 'utf-8')
    const packageManifest = JSON.parse(packageBlob)

    packageManifest.workspaces = ['packages/*']
    await fsp.writeFile(packagePath, JSON.stringify(packageManifest, null, 2))

    expect(await findWorkspaceRoot(subDir)).toBe(tempDir)
  })

  it('should return the path when package file found (single package)', async () => {
    const subDir = path.join(tempDir, 'src')

    await fsp.cp(fixture('example-repo'), tempDir, { recursive: true })
    await fsp.mkdir(subDir, { recursive: true })

    expect(await findWorkspaceRoot(subDir)).toBe(tempDir)
  })

  it('should stop when finding a .git directory', async () => {
    const subDir = path.join(tempDir, 'packages', 'package-a')
    const gitDir = path.join(tempDir, '.git')

    await fsp.cp(fixture('_git'), gitDir, { recursive: true })
    await fsp.mkdir(subDir, { recursive: true })

    expect(await findWorkspaceRoot(subDir)).toBe(tempDir)
  })

  it('should return null when no workspace root is found', async () => {
    const subDir = path.join(tempDir, 'packages', 'package-a')

    await fsp.mkdir(subDir, { recursive: true })

    expect(await findWorkspaceRoot(subDir)).toBeNull()
  })
})

describe('findProjectRoot', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true })
  })

  it('should find the project root by package file', async () => {
    const subDir = path.join(tempDir, 'src')

    await fsp.cp(fixture('example-repo'), tempDir, { recursive: true })
    await fsp.mkdir(subDir, { recursive: true })

    expect(await findProjectRoot(subDir)).toBe(tempDir)
  })

  it('should return the project root if a .git directory is found', async () => {
    const subDir = path.join(tempDir, 'src')
    const gitDir = path.join(tempDir, '.git')

    await fsp.cp(fixture('_git'), gitDir, { recursive: true })
    await fsp.mkdir(subDir, { recursive: true })

    expect(await findProjectRoot(subDir)).toBe(tempDir)
  })

  it('should work in a monorepo project', async () => {
    const projectDir = path.join(tempDir, 'packages', 'package-a')
    const projectSubDir = path.join(projectDir, 'src')

    await fsp.cp(fixture('example-repo'), tempDir, { recursive: true })
    await fsp.mkdir(projectSubDir, { recursive: true })
    await fsp.cp(fixture('example-repo'), projectDir, { recursive: true })

    expect(await findProjectRoot(projectSubDir)).toBe(projectDir)
  })

  it('should return null when no condition is met', async () => {
    const subDir = path.join(tempDir, 'src')

    await fsp.mkdir(subDir, { recursive: true })

    expect(await findProjectRoot(subDir)).toBeNull()
  })
})

describe('findPackageFile', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true })
  })

  it('should find the nearest package file', async () => {
    const projectDir = path.join(tempDir, 'packages', 'package-a')
    const projectSubDir = path.join(projectDir, 'src')

    await fsp.cp(fixture('example-repo'), tempDir, { recursive: true })
    await fsp.mkdir(projectSubDir, { recursive: true })
    await fsp.cp(fixture('example-repo'), projectDir, { recursive: true })

    expect(await findPackageFile(projectSubDir)).toBe(path.join(projectDir, 'package.json'))
  })

  it('should stop when finding a .git directory', async () => {
    const subDir = path.join(tempDir, 'packages', 'package-a')
    const gitDir = path.join(tempDir, '.git')

    await fsp.cp(fixture('_git'), gitDir, { recursive: true })
    await fsp.mkdir(subDir, { recursive: true })

    expect(await findPackageFile(subDir)).toBeNull()
  })

  it('should return null when no package file is found', async () => {
    const subDir = path.join(tempDir, 'src')

    await fsp.mkdir(subDir, { recursive: true })

    expect(await findPackageFile(subDir)).toBeNull()
  })
})
