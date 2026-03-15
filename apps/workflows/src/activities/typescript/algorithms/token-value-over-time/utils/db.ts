import { createTokenTransferRepository } from '@reputo/onchain-data';

import config from '../../../../../config/index.js';

export async function createOnchainTransferRepo() {
  return createTokenTransferRepository({
    dbPath: config.onchainData.dbPath,
  });
}
