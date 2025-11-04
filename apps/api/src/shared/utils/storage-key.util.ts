import { InvalidContentTypeException } from '../exceptions';

function getExtensionFromContentType(contentType: string): string {
  const extensionMap: Record<string, string> = {
    'text/csv': 'csv',
  };

  return extensionMap[contentType] || 'bin';
}

function sanitizeFilename(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  const sanitized = nameWithoutExt.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');

  return sanitized.slice(0, 200) || 'file';
}

export function generateUploadKey(filename: string, contentType: string, now: Date = new Date()): string {
  const timestamp = Math.floor(now.getTime() / 1000);
  const ext = getExtensionFromContentType(contentType);
  const sanitized = sanitizeFilename(filename);

  return `uploads/${timestamp}/${sanitized}.${ext}`;
}

export function parseStorageKey(key: string): {
  filename: string;
  ext: string;
  timestamp: number;
} {
  const parts = key.split('/');

  if (parts.length < 3 || parts[0] !== 'uploads') {
    throw new Error(`Invalid storage key format: ${key}`);
  }

  const timestamp = Number.parseInt(parts[1], 10);
  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid timestamp in storage key: ${key}`);
  }

  const filenamePart = parts.slice(2).join('/');
  const lastDotIndex = filenamePart.lastIndexOf('.');
  if (lastDotIndex === -1) {
    throw new Error(`No extension found in storage key: ${key}`);
  }

  const filename = filenamePart.substring(0, lastDotIndex);
  const ext = filenamePart.substring(lastDotIndex + 1);

  return {
    filename: `${filename}.${ext}`,
    ext,
    timestamp,
  };
}
