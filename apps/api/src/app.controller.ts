import { Controller, Get } from '@nestjs/common';
import { type AlgorithmDefinition } from '@reputo/reputation-algorithms';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('algorithms')
  getAvailableAlgorithms(): AlgorithmDefinition {
    return this.appService.getAvailableAlgorithms();
  }

  @Get('healthz')
  getHealth() {
    return this.appService.getHealth();
  }
}
