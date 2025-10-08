/**
 * Supported algorithm categories for organizing reputation algorithms.
 */
export type AlgorithmCategory =
  | 'engagement' // Algorithms focused on user engagement metrics
  | 'quality' // Algorithms measuring content or user quality
  | 'activity' // Algorithms tracking user activity patterns
  | 'custom'; // Custom or specialized algorithms

/**
 * Supported input/output types for algorithm definitions.
 */
export type IoType =
  | 'csv' // Comma-separated values data
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
 * Union type for all supported input/output item types.
 */
export type IoItem = CsvIoItem;

/**
 * Complete algorithm definition structure.
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
}
