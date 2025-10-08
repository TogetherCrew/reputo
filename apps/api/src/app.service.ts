import { Injectable } from '@nestjs/common';
import {
  getAlgorithmDefinition,
  getAlgorithmDefinitionKeys,
  getAlgorithmDefinitionLatestVersion,
  getAlgorithmDefinitionVersions,
} from '@reputo/reputation-algorithms';

@Injectable()
export class AppService {
  getAvailableAlgorithms(): string {
    const algorithm = getAlgorithmDefinition({ key: 'voting_engagement' });
    console.log('Available algorithms:', getAlgorithmDefinitionKeys());
    console.log('Algorithm versions:', getAlgorithmDefinitionVersions('voting_engagement'));
    console.log('Algorithm latest version:', getAlgorithmDefinitionLatestVersion('voting_engagement'));

    return algorithm;
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
