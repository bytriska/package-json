export interface WorkspaceTest {
  files: string[]
  test?: (filepath: string) => boolean | Promise<boolean>
}

export interface FindFileOptions {
  dir: string
  test?: (fPath: string) => boolean | Promise<boolean>
}

export interface ThrowableOptions {
  /**
   * If set to `true`, the operation will not return an error if it fails.
   */
  try?: boolean
}
