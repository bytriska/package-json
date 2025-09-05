type Dependencies = Record<string, string>

type PackageBin = string | { [commandName: string]: string }

type PackageScripts = {
  [name: string]: string
} & {
  prepublish?: string
  prepare?: string
  prepublishOnly?: string
  prepack?: string
  postpack?: string
  publish?: string
  postpublish?: string
  preinstall?: string
  install?: string
  postinstall?: string
  preuninstall?: string
  uninstall?: string
  postuninstall?: string
  preversion?: string
  version?: string
  postversion?: string
  pretest?: string
  test?: string
  posttest?: string
  prestop?: string
  stop?: string
  poststop?: string
  prestart?: string
  start?: string
  poststart?: string
  prerestart?: string
  restart?: string
  postrestart?: string
  preshrinkwrap?: string
  shrinkwrap?: string
  postshrinkwrap?: string
}

interface PeerDependenciesMeta {
  [dependencyName: string]: {
    optional?: boolean
  }
}

interface DependenciesMeta {
  [dependencyName: string]: {
    injected?: boolean
    node?: string
    patch?: string
  }
}

interface DevEngineDependency {
  name: string
  version?: string
  onFail?: 'ignore' | 'warn' | 'error' | 'download'
}

interface DevEngines {
  os?: DevEngineDependency | DevEngineDependency[]
  cpu?: DevEngineDependency | DevEngineDependency[]
  libc?: DevEngineDependency | DevEngineDependency[]
  runtime?: DevEngineDependency | DevEngineDependency[]
  packageManager?: DevEngineDependency | DevEngineDependency[]
}

interface PublishConfig extends Record<string, unknown> {
  directory?: string
  linkDirectory?: boolean
  executableFiles?: string[]
  registry?: string
}

type Version = string
type Pattern = string
interface TypesVersions {
  [version: Version]: {
    [pattern: Pattern]: string[]
  }
}

export interface PackageManifest {
  name?: string
  version?: string
  type?: string
  bin?: PackageBin
  description?: string
  directories?: {
    bin?: string
  }
  files?: string[]
  funding?: string
  dependencies?: Dependencies
  devDependencies?: Dependencies
  optionalDependencies?: Dependencies
  peerDependencies?: Dependencies
  peerDependenciesMeta?: PeerDependenciesMeta
  dependenciesMeta?: DependenciesMeta
  bundleDependencies?: string[] | boolean
  bundledDependencies?: string[] | boolean
  homepage?: string
  repository?: string | { url: string }
  bugs?:
    | string
    | {
      url?: string
      email?: string
    }
  scripts?: PackageScripts
  config?: object
  engines?: {
    node?: string
    npm?: string
    pnpm?: string
  }
  devEngines?: DevEngines
  cpu?: string[]
  os?: string[]
  libc?: string[]
  main?: string
  module?: string
  typings?: string
  types?: string
  publishConfig?: PublishConfig
  typesVersions?: TypesVersions
  readme?: string
  keywords?: string[]
  author?: string
  license?: string
  exports?: Record<string, string>
  imports?: Record<string, unknown>
}
