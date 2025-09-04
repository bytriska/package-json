import fsp from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadJsonFile, saveJsonFile } from '../src/parser/json'
import { createTempDir } from './utils'

describe('json', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fsp.rm(tempDir, { recursive: true, force: true })
  })

  it('should load and parse the json file to an object', async () => {
    const filepath = path.join(tempDir, 'file.json')
    const content = { name: 'test', version: '0.0.0' }
    const blob = JSON.stringify(content, null, 2)

    await fsp.writeFile(filepath, blob)

    expect(await loadJsonFile(filepath)).toEqual(content)
  })

  it('should load and parse the json file with BOM to an object', async () => {
    const filepath = path.join(tempDir, 'file.json')
    const content = { name: 'test', version: '0.0.0' }
    const blob = JSON.stringify(content, null, 2)
    const bom = '\uFEFF' // BOM character

    await fsp.writeFile(filepath, bom.concat(blob))

    expect(await loadJsonFile(filepath)).toEqual(content)
  })

  it('should save and format the object to a json file', async () => {
    const filepath = path.join(tempDir, 'file.json')
    const content = { name: 'test', version: '0.0.0' }
    const blob = JSON.stringify(content, null, 2).concat('\n')

    await saveJsonFile(filepath, content)

    expect(await fsp.readFile(filepath, 'utf-8')).toBe(blob)
  })
})
