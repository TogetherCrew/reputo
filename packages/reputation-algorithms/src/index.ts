export function helloWorld(name?: string): string {
  return `Hello ${name || 'world'}!`;
}

export type {
  AlgorithmCategory,
  AlgorithmDefinition,
  AlgorithmKey,
  CSVColumn,
  CSVColumnType,
  CSVMeta,
  ErrorCode,
  IOItem,
  IOPrimitiveType,
  JsonSchema2020_12,
  NotFoundErrorCode,
  ValidationErrorDetail,
  VersionString,
} from './api/index.js';
export {
  getAlgorithmDefinition,
  listAlgorithmDefinitionKeys,
  listAlgorithmDefinitionVersions,
  NotFoundError,
  resolveLatestVersion,
} from './api/index.js';
