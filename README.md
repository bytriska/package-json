# @bytriska/package-json

> Simple utilities to find the workspace root, read and write package.json files, and more.

## Instalation

```bash
pnpm add @bytriska/package-json
```

## Reference

### `findWorkspaceRoot`

**Type Signature:**

```ts
async function findWorkspaceRoot(cwd: string): Promise<string | null>
```

**Example Usage:**

```ts
import { findWorkspaceRoot } from '@bytriska/package-json'

async function main() {
  const workspacePath = await findWorkspaceRoot(process.cwd())
  console.log('Workspace path:', workspacePath)
}

main()
```

### `findProjectRoot`

**Type Signature:**

```ts
async function findProjectRoot(cwd: string): Promise<string | null>
```

**Example Usage:**

```ts
import { findProjectRoot } from '@bytriska/package-json'

async function main() {
  const projectPath = await findProjectRoot(process.cwd())
  console.log('Project path:', projectPath)
}

main()
```

### `findPackageFile`

**Type Signature:**

```ts
async function findPackageFile(cwd: string): Promise<string | null>
```

**Example Usage:**

```ts
import { findPackageFile } from '@bytriska/package-json'

async function main() {
  const packageFilepath = await findPackageFile(process.cwd())
  console.log('Package file path:', packageFilepath)
}

main()
```

## License

[MIT](./LICENSE.md)
