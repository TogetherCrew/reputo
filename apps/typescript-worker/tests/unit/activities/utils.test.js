import { describe, expect, it } from 'vitest';
import { getInputLocation } from '../../../src/activities/utils.js';

describe('getInputLocation', () => {
  it('should return the storage key for a valid input', () => {
    const inputLocations = [
      { key: 'votes', value: 'snapshots/123/inputs/votes.csv' },
      { key: 'users', value: 'snapshots/123/inputs/users.csv' },
    ];
    const result = getInputLocation(inputLocations, 'votes');
    expect(result).toBe('snapshots/123/inputs/votes.csv');
  });
  it('should throw an error if the input key is missing', () => {
    const inputLocations = [{ key: 'votes', value: 'snapshots/123/inputs/votes.csv' }];
    expect(() => getInputLocation(inputLocations, 'users')).toThrow('Missing input "users"');
  });
  it('should throw an error if the input value is not a string', () => {
    const inputLocations = [{ key: 'votes', value: 123 }];
    expect(() => getInputLocation(inputLocations, 'votes')).toThrow('Input "votes" has invalid value type');
  });
  it('should throw an error if the input value is null', () => {
    const inputLocations = [{ key: 'votes', value: null }];
    expect(() => getInputLocation(inputLocations, 'votes')).toThrow('Input "votes" has invalid value type');
  });
  it('should throw an error if the input value is undefined', () => {
    const inputLocations = [{ key: 'votes', value: undefined }];
    expect(() => getInputLocation(inputLocations, 'votes')).toThrow('Input "votes" has invalid value type');
  });
});
