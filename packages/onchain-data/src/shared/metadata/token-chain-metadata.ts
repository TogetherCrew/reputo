import { TOKEN_CONTRACT_ADDRESSES } from '../constants/contract-addresses.js';
import { TOKEN_TRANSFER_START_BLOCKS } from '../constants/start-blocks.js';
import { SupportedChain, SupportedProvider, SupportedToken, SupportedTokenChain } from '../enums/index.js';

export type TokenChainMetadata = {
  provider: SupportedProvider;
  token: SupportedToken;
  chain: SupportedChain;
  contractAddress: string;
  startBlock: number;
};

export const TOKEN_CHAIN_METADATA: Record<SupportedTokenChain, TokenChainMetadata> = {
  [SupportedTokenChain.FET_ETHEREUM]: {
    provider: SupportedProvider.ALCHEMY,
    token: SupportedToken.FET,
    chain: SupportedChain.ETHEREUM,
    contractAddress: TOKEN_CONTRACT_ADDRESSES[SupportedTokenChain.FET_ETHEREUM],
    startBlock: TOKEN_TRANSFER_START_BLOCKS[SupportedTokenChain.FET_ETHEREUM],
  },
};
