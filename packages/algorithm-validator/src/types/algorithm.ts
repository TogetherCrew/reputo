/**
 * Algorithm definition types for validation purposes.
 *
 * These types are a subset of the full algorithm types, containing only
 * what's needed for payload and CSV validation. This allows the validator
 * package to be independent and usable without the full reputation-algorithms
 * package.
 */

/**
 * Supported algorithm categories for organizing reputation algorithms.
 */
export type AlgorithmCategory =
  | 'Engagement' // Algorithms focused on user engagement metrics
  | 'Quality' // Algorithms measuring content or user quality
  | 'Activity' // Algorithms tracking user activity patterns
  | 'Custom'; // Custom or specialized algorithms

/**
 * Supported input/output types for algorithm definitions.
 */
export type IoType =
  | 'csv' // Comma-separated values data
  | 'json' // JSON output/input (file or object)
  | 'number' // Numeric values
  | 'boolean' // True/false values
  | 'array' // Array of values
  | 'score_map' // Mapping of scores to entities
  | 'string' // Text values
  | 'object' // Complex object structures
  | (string & {}); // Allow additional string literals

/**
 * Base interface for all input/output items in algorithm definitions.
 */
interface BaseIoItem {
  /** Unique identifier for the I/O item */
  key: string;
  /** Human-readable label for display purposes */
  label?: string;
  /** Detailed description of the I/O item's purpose and usage */
  description?: string;
}

/**
 * CSV input/output item configuration for algorithm definitions.
 */
export interface CsvIoItem extends BaseIoItem {
  /** Type identifier for CSV data */
  type: 'csv';
  /** CSV parsing and validation configuration */
  csv: {
    /** Whether the CSV file includes a header row */
    hasHeader?: boolean;
    /** Character used to separate values (default: comma) */
    delimiter?: string;
    /** Maximum number of rows to process */
    maxRows?: number;
    /** Maximum file size in bytes */
    maxBytes?: number;
    /** Column definitions for data validation and processing */
    columns: Array<{
      /** Unique identifier for the column */
      key: string;
      /** Data type expected in this column */
      type:
        | 'string' // Text data
        | 'integer' // Whole numbers
        | 'number' // Decimal numbers
        | 'date' // Date/time values
        | 'enum' // Predefined values
        | (string & {}); // Allow additional types
      /** Whether this column is required for processing */
      required?: boolean;
      /** Valid values for enum-type columns */
      enum?: Array<string | number>;
      /** Alternative names that can be used for this column */
      aliases?: string[];
      /** Description of the column's purpose and expected data */
      description?: string;
    }>;
  };
  /** Entity type that this CSV data represents (e.g., 'user', 'post', 'comment') */
  entity?: string;
}

/**
 * JSON input/output item configuration for algorithm definitions.
 *
 * For server execution, JSON outputs are typically stored as a JSON file in storage (e.g. S3 key).
 */
export interface JsonIoItem extends BaseIoItem {
  /** Type identifier for JSON data */
  type: 'json';
  /** Optional entity type that this JSON represents */
  entity?: string;
}

/**
 * Numeric input item configuration for algorithm definitions.
 */
export interface NumericIoItem extends BaseIoItem {
  /** Type identifier for numeric data */
  type: 'number' | 'integer';
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Default value */
  default?: number;
  /** Step increment for the input */
  step?: number;
  /** Whether this input is required */
  required?: boolean;
  /** UI rendering hints */
  uiHint?: {
    /** Widget type for rendering (e.g., 'slider', 'input') */
    widget?: 'slider' | 'input' | string;
  };
}

/**
 * Boolean input item configuration for algorithm definitions.
 */
export interface BooleanIoItem extends BaseIoItem {
  /** Type identifier for boolean data */
  type: 'boolean';
  /** Default value */
  default?: boolean;
  /** Whether this input is required */
  required?: boolean;
}

/**
 * String input item configuration for algorithm definitions.
 */
export interface StringIoItem extends BaseIoItem {
  /** Type identifier for string data */
  type: 'string';
  /** Default value */
  default?: string;
  /** Whether this input is required */
  required?: boolean;
  /** Minimum length for the string */
  minLength?: number;
  /** Maximum length for the string */
  maxLength?: number;
}

/**
 * Union type for all supported input/output item types.
 */
export type IoItem = CsvIoItem | JsonIoItem | NumericIoItem | BooleanIoItem | StringIoItem;

/**
 * Supported runtimes (languages) for algorithm execution.
 */
export type AlgorithmRuntime = 'typescript' | 'python';

/**
 * Complete algorithm definition structure.
 *
 * This interface defines the shape of an algorithm definition object,
 * which describes inputs, outputs, and runtime configuration for a
 * reputation algorithm.
 */
export interface AlgorithmDefinition {
  /** Unique identifier for the algorithm */
  key: string;
  /** Human-readable name of the algorithm */
  name: string;
  /** Category classification for organizing algorithms */
  category: AlgorithmCategory;
  /** Detailed description of what the algorithm does and how it works */
  description: string;
  /** Semantic version of the algorithm definition */
  version: string;
  /** Array of input data specifications */
  inputs: IoItem[];
  /** Array of output data specifications */
  outputs: IoItem[];
  /** Runtime (language) used for execution routing */
  runtime: AlgorithmRuntime;
}
