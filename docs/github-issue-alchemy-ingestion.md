# Alchemy ERC-20 transfer ingestion (onchain-data)

## Summary

Implement the EVM Alchemy adapter that fetches ERC-20 `Transfer` events via `alchemy_getAssetTransfers`, handles pagination/retries, and normalizes provider payloads into the package transfer model.

**Full spec:** [Notion task](https://www.notion.so/onchain-data-implement-Alchemy-transfer-ingestion-31dbaa0b57518125b527c4116b78bf50)

## Scope

- **In:** `providers/evm/alchemy` implementation, token-scoped sync (`chain` + `tokenContractAddress` + block range), finalized-block capping, `pageKey` pagination, retries, normalization, raw payload retention. Initial use case: Ethereum mainnet + FET ERC-20 (config-driven, not hardcoded).
- **Out:** Sync cursor persistence, non-EVM chains, reorg handling, pending/head sync, hardcoded token or chain.

## Acceptance (high level)

- Adapter accepts `chain` and `tokenContractAddress` as inputs.
- Uses `alchemy_getAssetTransfers` with `category: ["erc20"]`, `contractAddresses: [tokenContractAddress]`, `excludeZeroValue: false`, `maxCount: 1000`.
- Resolves latest finalized block; fetches only `fromBlock..min(requestedToBlock, finalizedBlock)`; ascending order; paginate with `pageKey` until done.
- Normalize to transfer records; preserve raw provider payload.
- One config/example path for Ethereum mainnet + FET ERC-20 contract.

## Verification

```bash
pnpm --filter @reputo/onchain-data test
pnpm --filter @reputo/onchain-data typecheck
```

---

*Detail, implementation checklist, and QA steps are in the Notion task.*
