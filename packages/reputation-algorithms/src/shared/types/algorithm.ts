export type IOType = 'csv' | 'number' | 'boolean' | 'array' | 'score_map' | 'string' | 'object' | (string & {});

export interface IoItem {
  key: string;
  type: IOType;
  label?: string;
  description?: string;

  csv?: {
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

export interface AlgorithmDefinition {
  key: string;
  name: string;
  category: 'engagement' | 'quality' | 'activity' | 'custom';
  description: string;
  version: string;
  inputs: IoItem[];
  outputs: IoItem[];
}
