export interface AlgorithmVersion {
  readonly key: string;
  readonly version: string;
  readonly filePath: string;
}

export interface RegistryIndex {
  readonly algorithms: ReadonlyMap<string, readonly AlgorithmVersion[]>;
  readonly totalAlgorithms: number;
  readonly totalVersions: number;
}

export interface RegistryGeneratorConfig {
  readonly registryPath: string;
  readonly outputPath: string;
  readonly includeMetadata?: boolean;
}
