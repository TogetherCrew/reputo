import { createAssetTransferRepository } from '@reputo/onchain-data';

import config from '../../../../../config/index.js';

export async function createOnchainTransferRepo() {
  return createAssetTransferRepository({
    dbPath: config.onchainData.dbPath,
  });
}
