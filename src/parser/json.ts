import fsp from 'node:fs/promises'
import path from 'node:path'
import { writeFileAtomic } from '../utils'

export async function loadJsonFile<T = unknown>(filePath: string): Promise<T> {
  const blob = await fsp.readFile(filePath)
  const textDecoder = new TextDecoder('utf-8')
  const content = textDecoder.decode(blob) // to avoid BOM issue

  return JSON.parse(content) as T
}

interface SaveJsonOptions {
  indent?: number | string
}

export async function saveJsonFile(
  filePath: string,
  data: unknown,
  options?: SaveJsonOptions,
): Promise<void> {
  const blob = JSON.stringify(data, null, options?.indent ?? 2)

  await fsp.mkdir(path.dirname(filePath), { recursive: true })
  await writeFileAtomic(filePath, blob.concat('\n'))
}
