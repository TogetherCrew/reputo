import { describe, expect, it } from 'vitest';
import { getHello } from './hello1.service';

describe('API getHello', () => {
  it('returns greeting', () => {
    expect(getHello()).toBe('Hello World');
  });
});
