/**
 * Algorithm key type - used to identify algorithms
 */
export type AlgorithmKey = string;

/**
 * Semantic version string type
 */
export type VersionString = string;

/**
 * JSON Schema 2020-12 type
 */
export type JsonSchema2020_12 = Readonly<Record<string, unknown>>;

/**
 * Primitive types supported for IO items
 */
export type IOPrimitiveType = 'csv' | 'number' | 'integer' | 'boolean' | 'array' | 'score_map' | 'string' | 'object';

/**
 * Column types supported in CSV inputs
 */
export type CSVColumnType = 'string' | 'integer' | 'number' | 'date' | 'enum';

/**
 * Algorithm categories for organization and filtering
 */
export type AlgorithmCategory = 'engagement' | 'quality' | 'activity' | 'custom';

/**
 * CSV column definition
 */
export interface CSVColumn {
  readonly key: string;
  readonly type: CSVColumnType;
  readonly required?: boolean;
  readonly enum?: readonly (string | number)[];
  readonly aliases?: readonly string[];
  readonly description?: string;
}

/**
 * CSV metadata configuration
 */
export interface CSVMeta {
  readonly hasHeader?: boolean;
  readonly delimiter?: string;
  readonly maxRows?: number;
  readonly maxBytes?: number;
  readonly columns: readonly CSVColumn[];
}

/**
 * Input/Output item definition
 */
export interface IOItem {
  readonly key: string;
  readonly label?: string;
  readonly description?: string;
  readonly type: IOPrimitiveType;
  readonly csv?: CSVMeta;
  readonly entity?: string;
}

/**
 * Complete algorithm definition
 */
export interface AlgorithmDefinition {
  readonly key: AlgorithmKey;
  readonly name: string;
  readonly category: AlgorithmCategory;
  readonly description: string;
  readonly version: VersionString;
  readonly inputs: readonly IOItem[];
  readonly outputs: readonly IOItem[];
}
