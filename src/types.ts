export interface WorkspaceTest {
  files: string[]
  test?: (filepath: string) => boolean | Promise<boolean>
}

export interface FindFileOptions {
  dir: string
  test?: (fPath: string) => boolean | Promise<boolean>
}
