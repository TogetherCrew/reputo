// API Types generated from OpenAPI spec

export interface SpecDto {
  key: string;
  version: string;
}

export interface InputDto {
  key: string;
  value?: unknown;
}

export interface CreateAlgorithmPresetDto {
  key: string;
  version: string;
  inputs: InputDto[];
  name?: string;
  description?: string;
}

export interface SpecResponseDto {
  key: string;
  version: string;
}

export interface InputResponseDto {
  key: string;
  value?: unknown;
}

export interface AlgorithmPresetResponseDto {
  _id: string;
  key: string;
  version: string;
  inputs: InputResponseDto[];
  name?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAlgorithmPresetResponseDto {
  results: AlgorithmPresetResponseDto[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface UpdateAlgorithmPresetDto {
  inputs?: InputDto[];
  name?: string;
  description?: string;
}

export interface TemporalDto {
  workflowId?: string;
  runId?: string;
  taskQueue?: string;
}

export interface CreateSnapshotDto {
  algorithmPreset: string;
  temporal?: TemporalDto;
  outputs?: Record<string, unknown>;
}

export interface TemporalResponseDto {
  workflowId?: string;
  runId?: string;
  taskQueue?: string;
}

export interface SnapshotResponseDto {
  _id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  temporal?: TemporalResponseDto;
  algorithmPreset: string;
  outputs?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSnapshotResponseDto {
  results: SnapshotResponseDto[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Query parameters
export interface AlgorithmPresetQueryParams {
  sortBy?: string;
  populate?: string;
  limit?: number;
  page?: number;
  key?: string;
  version?: string;
}

export interface SnapshotQueryParams {
  sortBy?: string;
  populate?: string;
  limit?: number;
  page?: number;
  status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  algorithmPreset?: string;
  key?: string;
  version?: string;
}
