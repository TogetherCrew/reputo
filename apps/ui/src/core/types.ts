/**
 * Core type definitions for ReputoSchema
 */

export type ColumnType = "string" | "number" | "date" | "enum" | "boolean";

export interface ColumnDefinition {
  key: string;
  type: ColumnType;
  aliases?: string[];
  description?: string;
  required?: boolean;
  enum?: string[];
}

export interface CSVConfig {
  hasHeader: boolean;
  delimiter: string;
  maxRows?: number;
  maxBytes?: number;
  columns: ColumnDefinition[];
}

export type InputType = "text" | "number" | "boolean" | "date" | "enum" | "csv" | "slider";

export interface BaseInput {
  key: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface TextInput extends BaseInput {
  type: "text";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface NumberInput extends BaseInput {
  type: "number";
  min?: number;
  max?: number;
}

export interface BooleanInput extends BaseInput {
  type: "boolean";
}

export interface DateInput extends BaseInput {
  type: "date";
  minDate?: string;
  maxDate?: string;
}

export interface EnumInput extends BaseInput {
  type: "enum";
  enum: string[];
}

export interface CSVInput extends BaseInput {
  type: "csv";
  csv: CSVConfig;
}

export interface SliderInput extends BaseInput {
  type: "slider";
  min: number;
  max: number;
  step?: number;
}

export type Input =
  | TextInput
  | NumberInput
  | BooleanInput
  | DateInput
  | EnumInput
  | CSVInput
  | SliderInput;

export interface Output {
  key: string;
  label: string;
  type: string;
  entity?: string;
  description?: string;
}

export interface ReputoSchema {
  key: string;
  name: string;
  category: string;
  description: string;
  version: string;
  inputs: Input[];
  outputs: Output[];
}

/**
 * Validation result type
 */
export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

