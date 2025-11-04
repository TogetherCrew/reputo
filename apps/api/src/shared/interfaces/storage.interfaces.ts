export interface PresignedUpload {
  key: string;
  url: string;
  expiresIn: number;
}

export interface PresignedDownload {
  url: string;
  expiresIn: number;
  metadata: {
    filename: string;
    ext: string;
    size: number;
    contentType: string;
    timestamp: number;
  };
}

export interface StorageMetadata {
  key: string;
  metadata: {
    filename: string;
    ext: string;
    size: number;
    contentType: string;
    timestamp: number;
  };
}

export interface S3Error {
  name?: string;
  message?: string;
  $metadata?: {
    httpStatusCode?: number;
  };
}
