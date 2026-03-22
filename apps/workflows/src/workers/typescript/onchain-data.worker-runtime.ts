import config from '../../config/index.js';

export type OnchainDataWorkerRuntimeConfig = {
  alchemyApiKey: string;
  databaseUrl: string;
};

export function getOnchainDataWorkerRuntimeConfig(): OnchainDataWorkerRuntimeConfig {
  if (config.onchainData.alchemyApiKey == null) {
    throw new Error('Config validation error: ALCHEMY_API_KEY is required for onchain-data worker');
  }

  return {
    alchemyApiKey: config.onchainData.alchemyApiKey,
    databaseUrl: config.onchainData.uri,
  };
}
