// Build/CLI types (used internally)

// Runtime errors (used by API)
export type { NotFoundErrorCode } from './errors/index.js';
// Build-time errors (used by CLI)
export {
  BuildError,
  DuplicateError,
  KeyMismatchError,
  NotFoundError,
  ValidationError,
  VersionMismatchError,
} from './errors/index.js';
export type {
  AlgorithmDefinition,
  AlgorithmVersion,
  IOType,
  IoItem,
  RegistryGeneratorConfig,
  RegistryIndex,
  ValidationResult,
} from './types/index.js';
