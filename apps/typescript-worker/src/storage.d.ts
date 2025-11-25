import type { Storage } from './storage.js';

declare global {
  // eslint-disable-next-line no-var
  var storage: Storage;
}
