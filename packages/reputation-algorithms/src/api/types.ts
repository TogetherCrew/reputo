export type AlgorithmKey = string;

export type VersionString = string;

export type JsonSchema2020_12 = Readonly<Record<string, unknown>>;

export type IOPrimitiveType = 'csv' | 'number' | 'integer' | 'boolean' | 'array' | 'score_map' | 'string' | 'object';

export type CSVColumnType = 'string' | 'integer' | 'number' | 'date' | 'enum';

export type AlgorithmCategory = 'engagement' | 'quality' | 'activity' | 'custom';

export interface CSVColumn {
  readonly key: string;
  readonly type: CSVColumnType;
  readonly required?: boolean;
  readonly enum?: readonly (string | number)[];
  readonly aliases?: readonly string[];
  readonly description?: string;
}

export interface CSVMeta {
  readonly hasHeader?: boolean;
  readonly delimiter?: string;
  readonly maxRows?: number;
  readonly maxBytes?: number;
  readonly columns: readonly CSVColumn[];
}

export interface IOItem {
  readonly key: string;
  readonly label?: string;
  readonly description?: string;
  readonly type: IOPrimitiveType;
  readonly csv?: CSVMeta;
  readonly entity?: string;
}

export interface AlgorithmDefinition {
  readonly key: AlgorithmKey;
  readonly name: string;
  readonly category: AlgorithmCategory;
  readonly description: string;
  readonly version: VersionString;
  readonly inputs: readonly IOItem[];
  readonly outputs: readonly IOItem[];
}
