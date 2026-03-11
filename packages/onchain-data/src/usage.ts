/**
 * Usage / test driver for @reputo/onchain-data.
 * Demonstrates all public API surface. Import only from index.
 *
 * Run from package root:
 *   pnpm --filter @reputo/onchain-data exec tsx src/usage.ts
 * Or after build:
 *   node dist/usage.js
 */

import type { SyncTokenTransfersResult } from './index.js';
import { createSyncTokenTransfersService, SupportedTokenChain } from './index.js';

const USAGE_DB_PATH = '/Users/behzad/Documents/Repos/reputo/akbar1.db';

// ---------------------------------------------------------------------------
// 1. Token transfer repository: create DB, insert records, query by address
// ---------------------------------------------------------------------------

// async function demoRepository(): Promise<void> {
//     // Run in a subprocess so we can timeout: DB open is synchronous and can block
//     // indefinitely when another process (e.g. TablePlus, another node) has the file open.
//     const dir = path.dirname(fileURLToPath(import.meta.url))
//     const pkgRoot = path.join(dir, '..')
//     const tsxBin = path.join(pkgRoot, 'node_modules', '.bin', 'tsx')
//     const workerScript = path.join(pkgRoot, 'src', 'usage-demo-worker.ts')
//     const result = await new Promise<{ count: number } | { error: string }>(
//         (resolve, reject) => {
//             let settled = false
//             let timeout: ReturnType<typeof setTimeout>
//             const once =
//                 (fn: (...args: unknown[]) => void) =>
//                 (...args: unknown[]) => {
//                     if (settled) return
//                     settled = true
//                     clearTimeout(timeout)
//                     fn(...args)
//                 }
//             const child = spawn(tsxBin, [workerScript], {
//                 cwd: pkgRoot,
//                 env: { ...process.env, USAGE_DB_PATH },
//                 stdio: ['ignore', 'pipe', 'pipe'],
//             })
//             let stdout = ''
//             let stderr = ''
//             child.stdout?.on('data', (c) => {
//                 stdout += c
//             })
//             child.stderr?.on('data', (c) => {
//                 stderr += c
//             })
//             timeout = setTimeout(
//                 once(() => {
//                     child.kill('SIGKILL')
//                     reject(
//                         new Error(
//                             `Database open timed out after ${REPO_DEMO_TIMEOUT_MS / 1000}s. Another process may have the DB open (e.g. TablePlus or another node process). Close it or use a different dbPath.`,
//                         ),
//                     )
//                 }),
//                 REPO_DEMO_TIMEOUT_MS,
//             )
//             child.on(
//                 'close',
//                 once((...args) => {
//                     const code = args[0] as number | null
//                     const line = stdout.trim().split('\n').pop() ?? ''
//                     if (line.startsWith('OK ')) {
//                         resolve({ count: Number.parseInt(line.slice(3), 10) })
//                     } else if (line.startsWith('ERR ')) {
//                         resolve({ error: line.slice(4) })
//                     } else if (code !== 0 && stderr) {
//                         resolve({ error: stderr.trim() })
//                     } else {
//                         resolve({
//                             error: code !== 0 ? `exit ${code}` : 'no output',
//                         })
//                     }
//                 }),
//             )
//             child.on(
//                 'error',
//                 once((err) => reject(err as Error)),
//             )
//         },
//     )

//     if ('count' in result) {
//         console.log('[Repository] findByAddress count:', result.count)
//     } else {
//         throw new Error(`[Repository] findByAddress error: ${result.error}`)
//     }
//     // // const sampleRecords: TokenTransferRecord[] = [
//     // //     {
//     // //         id: `${SupportedTokenChain.FET_ETHEREUM}:0xabc:0`,
//     // //         tokenChain: SupportedTokenChain.FET_ETHEREUM,
//     // //
//     // //         blockNumber: '0x1312d00',
//     // //         transactionHash: '0xabc',
//     // //         logIndex: 0,
//     // //         fromAddress: '0x1111111111111111111111111111111111111111',
//     // //         toAddress: '0x2222222222222222222222222222222222222222',
//     // //         amount: '100',
//     // //         blockTimestamp: '2024-01-01T00:00:00.000Z',
//     // //         rawJson: '{}',
//     // //         createdAt: new Date().toISOString(),
//     // //     },
//     // //     {
//     // //         id: `${SupportedTokenChain.FET_ETHEREUM}:0xdef:0`,
//     // //         tokenChain: SupportedTokenChain.FET_ETHEREUM,
//     // //
//     // //         blockNumber: '0x1312d01',
//     // //         transactionHash: '0xdef',
//     // //         logIndex: 0,
//     // //         fromAddress: '0x2222222222222222222222222222222222222222',
//     // //         toAddress: '0x1111111111111111111111111111111111111111',
//     // //         amount: '200',
//     // //         blockTimestamp: null,
//     // //         rawJson: '{}',
//     // //         createdAt: new Date().toISOString(),
//     // //     },
//     // // ]
//     // const inserted = repo.insertMany(sampleRecords)
//     // console.log('[Repository] insertMany:', inserted, 'rows inserted')
//     // const address = '0x1111111111111111111111111111111111111111'
//     // const all = repo.findByAddress({
//     //     tokenChain: SupportedTokenChain.FET_ETHEREUM,
//     //     address,
//     // })
//     // console.log('[Repository] findByAddress (both):', all.length, 'transfers')
//     // const inbound = repo.findByAddress({
//     //     tokenChain: SupportedTokenChain.FET_ETHEREUM,
//     //     address,
//     //     direction: TransferDirection.INBOUND,
//     // })
//     // console.log('[Repository] findByAddress (inbound):', inbound.length)
//     // const outbound = repo.findByAddress({
//     //     tokenChain: SupportedTokenChain.FET_ETHEREUM,
//     //     address,
//     //     direction: TransferDirection.OUTBOUND,
//     // })
//     // console.log('[Repository] findByAddress (outbound):', outbound.length)
//     // const inBlockRange = repo.findByAddress({
//     //     tokenChain: SupportedTokenChain.FET_ETHEREUM,
//     //     address,
//     //     fromBlock: '0x1312d00',
//     //     toBlock: '0x1312d00',
//     // })
//     // console.log(
//     //     '[Repository] findByAddress (block range):',
//     //     inBlockRange.length,
//     // )
//     // repo.close()
//     // console.log('[Repository] closed.')
// }

// ---------------------------------------------------------------------------
// 2. normalizeAlchemyEthereumTransfer: turn Alchemy API shape into record
// ---------------------------------------------------------------------------

// function demoNormalizeAlchemyTransfer(): void {
//     const mockAlchemyTransfer = {
//         blockNum: '0x1312d00', // 20_000_000
//         hash: '0xnormalized',
//         uniqueId: '0xnormalized:log:0x0',
//         from: '0x1111111111111111111111111111111111111111',
//         to: '0x2222222222222222222222222222222222222222',
//         value: 500,
//         asset: null,
//         category: 'external',
//         rawContract: { value: null, address: null, decimal: null },
//         metadata: { blockTimestamp: '2024-06-01T12:00:00.000Z' },
//     }

//     const record = normalizeAlchemyEthereumTransfer({
//         tokenChain: SupportedTokenChain.FET_ETHEREUM,
//         transfer: mockAlchemyTransfer,
//     })

//     console.log('[normalizeAlchemyEthereumTransfer] id:', record.id)
//     console.log('[normalizeAlchemyEthereumTransfer] amount:', record.amount)
//     console.log(
//         '[normalizeAlchemyEthereumTransfer] blockNumber:',
//         record.blockNumber,
//     )
// }

// ---------------------------------------------------------------------------
// 3. Sync token transfers service: sync from provider into same DB
// ---------------------------------------------------------------------------

async function demoSyncService(): Promise<void> {
  const apiKey = process.env.ALCHEMY_API_KEY ?? '';
  if (!apiKey) {
    console.log('[SyncService] Skipped (set ALCHEMY_API_KEY to run sync).');
    return;
  }

  // const repo = createTokenTransferRepository({ dbPath: USAGE_DB_PATH })

  const service = createSyncTokenTransfersService({
    tokenChain: SupportedTokenChain.FET_ETHEREUM,
    dbPath: USAGE_DB_PATH,
    alchemyApiKey: apiKey,
  });

  let result: SyncTokenTransfersResult;
  try {
    result = await service.sync();
    console.log('[SyncService] sync result:', {
      tokenChain: result.tokenChain,
      fromBlock: result.fromBlock,
      toBlock: result.toBlock,
      insertedCount: result.insertedCount,
    });
    if (result.insertedCount === 0) {
      console.log('[SyncService] insertedCount 0 is normal when DB is already synced up to toBlock.');
    }
  } finally {
    service.close();
  }
  console.log('[SyncService] closed.');
}

// ---------------------------------------------------------------------------
// Run all demos
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('--- @reputo/onchain-data usage (testing package) ---\n');

  // await demoRepository()
  // console.log('')

  // demoNormalizeAlchemyTransfer()
  // console.log('')

  await demoSyncService();

  console.log('\n--- done ---');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
