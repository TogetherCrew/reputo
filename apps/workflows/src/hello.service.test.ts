import { describe, expect, it } from 'vitest';
import { getHello } from './hello.service';

describe('API getHello', () => {
  it('returns greeting', () => {
    expect(getHello()).toBe('Hello World');
  });
});
