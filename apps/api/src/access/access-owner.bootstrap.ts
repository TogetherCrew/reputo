import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AccessService } from './access.service';

@Injectable()
export class AccessOwnerBootstrap implements OnApplicationBootstrap {
  constructor(private readonly accessService: AccessService) {}

  onApplicationBootstrap(): Promise<void> {
    return this.accessService.bootstrapOwner();
  }
}
