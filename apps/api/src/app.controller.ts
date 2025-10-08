import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('algorithms')
  getAvailableAlgorithms(): string {
    return this.appService.getAvailableAlgorithms();
  }

  @Get('healthz')
  getHealth() {
    return this.appService.getHealth();
  }
}
