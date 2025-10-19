import { beforeEach, describe, expect, test } from 'vitest';
import { AlgorithmPreset } from '../../../src/interfaces/index.js';
import AlgorithmPresetModel from '../../../src/models/AlgorithmPreset.model.js';

describe('AlgorithmPreset model', () => {
  describe('AlgorithmPreset validation', () => {
    let algorithmPreset: AlgorithmPreset;

    beforeEach(() => {
      algorithmPreset = {
        spec: {
          key: 'test-algorithm',
          version: '1.0.0',
        },
        inputs: [
          {
            key: 'threshold',
            value: 0.5,
          },
        ],
        name: 'Test Algorithm Preset',
        description: 'A test algorithm preset for validation',
      };
    });

    test('should correctly validate a valid algorithm preset', async () => {
      const doc = new AlgorithmPresetModel(algorithmPreset);
      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });
});
