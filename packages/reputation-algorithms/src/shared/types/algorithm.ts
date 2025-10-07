export type IoType = 'csv' | 'number' | 'boolean' | 'array' | 'score_map' | 'string' | 'object' | (string & {});

interface BaseIoItem {
  key: string;
  label?: string;
  description?: string;
}

export interface CsvIoItem extends BaseIoItem {
  type: 'csv';
  csv: {
    hasHeader?: boolean;
    delimiter?: string;
    maxRows?: number;
    maxBytes?: number;
    columns: Array<{
      key: string;
      type: 'string' | 'integer' | 'number' | 'date' | 'enum' | (string & {});
      required?: boolean;
      enum?: Array<string | number>;
      aliases?: string[];
      description?: string;
    }>;
  };
  entity?: string;
}

export type IoItem = CsvIoItem;

export interface AlgorithmDefinition {
  key: string;
  name: string;
  category: 'engagement' | 'quality' | 'activity' | 'custom';
  description: string;
  version: string;
  inputs: IoItem[];
  outputs: IoItem[];
}
