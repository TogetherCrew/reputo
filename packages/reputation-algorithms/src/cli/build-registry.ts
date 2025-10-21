import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { RegistryGeneratorConfig } from '../shared/types/registry.js';
import {
  generateRegistryIndexContent,
  generateRegistryStats,
  getModuleFileAndDir,
  resolveRegistryIndexPath,
  resolveRegistryPath,
  scanRegistryDirectory,
} from '../shared/utils/index.js';

const { dirname: __dirname } = getModuleFileAndDir(import.meta.url);

const DEFAULT_CONFIG: RegistryGeneratorConfig = {
  registryPath: resolveRegistryPath(__dirname),
  outputPath: resolveRegistryIndexPath(__dirname),
  includeMetadata: true,
};

export function buildRegistry(config: Partial<RegistryGeneratorConfig> = {}): void {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  console.log('🔍 Scanning registry directory...');
  console.log(`Registry path: ${finalConfig.registryPath}`);
  try {
    const registryIndex = scanRegistryDirectory(finalConfig.registryPath);

    console.log(generateRegistryStats(registryIndex));

    console.log('📝 Generating registry index...');
    const indexContent = generateRegistryIndexContent(registryIndex, finalConfig.includeMetadata);
    const normalizedContent = indexContent.endsWith('\n') ? indexContent : `${indexContent}\n`;

    const exists = existsSync(finalConfig.outputPath);
    const isUnchanged = exists && readFileSync(finalConfig.outputPath, 'utf-8') === normalizedContent;

    if (isUnchanged) {
      console.log('ℹ️ Registry index unchanged. Skipping write.');
      return;
    }

    mkdirSync(dirname(finalConfig.outputPath), { recursive: true });
    writeFileSync(finalConfig.outputPath, normalizedContent, 'utf-8');
    console.log(`✅ Registry index ${exists ? 'updated' : 'created'}: ${finalConfig.outputPath}`);
  } catch (error) {
    console.error('❌ Failed to generate registry index:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function main(): void {
  console.log('🚀 Starting registry generation...');
  buildRegistry();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
