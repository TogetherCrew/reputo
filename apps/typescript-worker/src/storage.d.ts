/**
 * Global type declarations for the TypeScript worker.
 */

import type { Storage } from '@reputo/storage';

declare global {
  // eslint-disable-next-line no-var
  var storage: Storage;
}

export {};

