/** RPC settings for a single chain */
export type AlchemyChainConfig = {
  rpcUrl: string;
};

/** Retry configuration for the Alchemy provider */
export type AlchemyRetryConfig = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
};

/** Full resolved Alchemy provider configuration */
export type AlchemyConfig = {
  chains: Record<string, AlchemyChainConfig>;
  requestTimeoutMs: number;
  concurrency: number;
  retry: AlchemyRetryConfig;
};

/** Partial input configuration (only `chains` is required) */
export type AlchemyConfigInput = {
  chains: Record<string, AlchemyChainConfig>;
  requestTimeoutMs?: number;
  concurrency?: number;
  retry?: Partial<AlchemyRetryConfig>;
};

/** Default values applied when the caller omits optional settings */
export const ALCHEMY_DEFAULTS: Omit<AlchemyConfig, 'chains'> = {
  requestTimeoutMs: 30_000,
  concurrency: 3,
  retry: {
    maxAttempts: 5,
    baseDelayMs: 1_000,
    maxDelayMs: 30_000,
  },
};

/** Resolve partial input into a fully populated config */
export function resolveAlchemyConfig(input: AlchemyConfigInput): AlchemyConfig {
  return {
    chains: input.chains,
    requestTimeoutMs: input.requestTimeoutMs ?? ALCHEMY_DEFAULTS.requestTimeoutMs,
    concurrency: input.concurrency ?? ALCHEMY_DEFAULTS.concurrency,
    retry: {
      maxAttempts: input.retry?.maxAttempts ?? ALCHEMY_DEFAULTS.retry.maxAttempts,
      baseDelayMs: input.retry?.baseDelayMs ?? ALCHEMY_DEFAULTS.retry.baseDelayMs,
      maxDelayMs: input.retry?.maxDelayMs ?? ALCHEMY_DEFAULTS.retry.maxDelayMs,
    },
  };
}

/**
 * Used to populate the `chain_id` field in normalized transfer records.
 */
export const CHAIN_IDS: Record<string, string> = {
  ethereum: '1',
};

/**
 * Example configuration for the initial production use case:
 * Ethereum mainnet FET ERC-20 transfers via Alchemy.
 *
 * Usage:
 * ```ts
 * const provider = createAlchemyProvider({
 *   chains: {
 *     ethereum: { rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` },
 *   },
 * });
 * const result = await provider.fetchErc20Transfers({
 *   ...ETHEREUM_FET_EXAMPLE,
 *   fromBlock: 0,
 *   requestedToBlock: 20_000_000,
 * });
 * ```
 */
export const ETHEREUM_FET_EXAMPLE = {
  chain: 'ethereum',
  tokenContractAddress: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
} as const;
