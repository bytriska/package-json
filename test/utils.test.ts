import fsp from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { findFile, pathExist, writeFileAtomic } from '../src/utils'
import { createTempDir } from './utils'

describe('findFile', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true })
  })

  it('should find a file that exists', async () => {
    const filepath = path.join(tempDir, 'file.txt')
    await fsp.writeFile(filepath, 'example content')

    expect(await findFile('file.txt', { dir: tempDir })).toBe(filepath)
    expect(await findFile(['nonexistent.txt', 'file.txt'], { dir: tempDir })).toBe(filepath)
  })

  it('should return null for a file that does not exist', async () => {
    expect(await findFile('nonexistent.txt', { dir: tempDir })).toBeNull()
  })
})

describe('pathExist', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true })
  })

  it('should return true when the path is exist whatever its a file or directory', async () => {
    const filepath = path.join(tempDir, 'file.txt')
    const dirpath = path.join(tempDir, 'dir')

    await fsp.writeFile(filepath, 'example content')
    await fsp.mkdir(dirpath, { recursive: true })

    expect(await pathExist(filepath, 'file')).toBe(true)
    expect(await pathExist(dirpath, 'dir')).toBe(true)
  })

  it('should return false when the path is not exist', async () => {
    const filepath = path.join(tempDir, 'file.txt')
    const dirpath = path.join(tempDir, 'dir')

    expect(await pathExist(filepath, 'file')).toBe(false)
    expect(await pathExist(dirpath, 'dir')).toBe(false)
  })
})

describe('writeFileAtomic', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true })
  })

  it('should success write file', async () => {
    const filepath = path.join(tempDir, 'file.txt')

    await writeFileAtomic(filepath, 'example content')

    expect(await fsp.readFile(filepath, 'utf-8')).toBe('example content')
  })

  it('should overide the existing file if already exist', async () => {
    const filepath = path.join(tempDir, 'file.txt')

    await fsp.writeFile(filepath, 'old content')
    await writeFileAtomic(filepath, 'new content')

    expect(await fsp.readFile(filepath, 'utf-8')).toBe('new content')
  })

  it('should not change the file if write failed', async () => {
    const filepath = path.join(tempDir, 'file.txt')
    await fsp.writeFile(filepath, 'old content')

    const spy = vi.spyOn(fsp, 'writeFile').mockRejectedValue(new Error('write failed'))

    await expect(writeFileAtomic(filepath, 'new content')).rejects.toThrow('write failed')
    expect(await fsp.readFile(filepath, 'utf-8')).toBe('old content')

    spy.mockRestore()
  })

  it('should not change the file if rename failed', async () => {
    const filepath = path.join(tempDir, 'file.txt')
    await fsp.writeFile(filepath, 'old content')

    const spy = vi.spyOn(fsp, 'rename').mockRejectedValue(new Error('rename failed'))

    await expect(writeFileAtomic(filepath, 'new content')).rejects.toThrow('rename failed')
    expect(await fsp.readFile(filepath, 'utf-8')).toBe('old content')

    spy.mockRestore()
  })
})
