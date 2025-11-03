export interface PresignedUpload {
  key: string;
  url: string;
  expiresIn: number;
}

export interface PresignedDownload {
  url: string;
  expiresIn: number;
}

export interface StorageMetadata {
  key: string;
  size: number;
  contentType: string;
}

export interface S3Error {
  name?: string;
  message?: string;
  $metadata?: {
    httpStatusCode?: number;
  };
}
