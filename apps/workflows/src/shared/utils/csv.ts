import { stringify } from 'csv-stringify';

/**
 * Asynchronously serialize records to a CSV string.
 *
 * Uses the callback-based `csv-stringify` API so that serialization yields to
 * the event loop instead of blocking it (unlike `csv-stringify/sync`).
 */
export function stringifyCsvAsync(
  records: Parameters<typeof stringify>[0],
  options: { header: boolean; columns: string[] },
): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify(records, options, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
}
