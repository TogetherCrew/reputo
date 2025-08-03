// apps/api/src/foo/foo.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class FooService {
  /** The ultimate answer to life, the universe and everything … */
  private readonly answerToEverything = 42;

  /**
   * Return the canonical answer.
   *
   * @returns 42
   */
  answer(): number {
    return this.answerToEverything;
  }
}
