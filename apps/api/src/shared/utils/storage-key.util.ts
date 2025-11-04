import { InvalidContentTypeException } from '../exceptions';

function formatUtcDate(now: Date): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateDateExtKey(contentType: string, now: Date = new Date()): string {
  const date = formatUtcDate(now);

  switch (contentType) {
    case 'text/csv':
      return `${date}.csv`;
    case 'text/plain':
      return `${date}.txt`;
    default:
      throw new InvalidContentTypeException(contentType, ['text/csv', 'text/plain']);
  }
}
