import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { FooService } from './foo.service';

describe('FooService', () => {
  let service: FooService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [FooService],
    }).compile();

    service = module.get(FooService);
  });

  it('returns 42', () => {
    expect(service.answer()).toBe(42);
  });
});
