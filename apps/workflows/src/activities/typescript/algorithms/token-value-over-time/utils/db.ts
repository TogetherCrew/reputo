import { createOnchainReadRepositories } from '@reputo/onchain-data';

import config from '../../../../../config/index.js';

export async function createOnchainRepos() {
  return createOnchainReadRepositories({
    databaseUrl: config.onchainData.uri,
  });
}
