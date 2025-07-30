import { Injectable } from '@nestjs/common';
import { helloWorld } from '@reptuo/reputation-algorithms';

@Injectable()
export class AppService {
  getHello(): string {
    console.log(helloWorld('Nest!!!'));
    return 'Hello World';
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
