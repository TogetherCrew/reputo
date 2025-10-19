import { describe, expect, it } from 'vitest';
import { createAlgorithmTemplate, keyToDisplayName } from '../../../../src/shared/utils/templates.js';

describe('Template Utils', () => {
  describe('keyToDisplayName', () => {
    it('should convert snake_case to Title Case', () => {
      expect(keyToDisplayName('user_activity')).toBe('User Activity');
      expect(keyToDisplayName('voting_engagement')).toBe('Voting Engagement');
      expect(keyToDisplayName('content_quality_score')).toBe('Content Quality Score');
    });

    it('should handle single words', () => {
      expect(keyToDisplayName('algorithm')).toBe('Algorithm');
      expect(keyToDisplayName('test')).toBe('Test');
    });

    it('should handle empty strings', () => {
      expect(keyToDisplayName('')).toBe('');
    });

    it('should handle keys with numbers', () => {
      expect(keyToDisplayName('algorithm_v2')).toBe('Algorithm V2');
      expect(keyToDisplayName('test_123_algo')).toBe('Test 123 Algo');
    });

    it('should handle consecutive underscores', () => {
      expect(keyToDisplayName('test__algorithm')).toBe('Test  Algorithm');
    });
  });

  describe('createAlgorithmTemplate', () => {
    it('should create basic template with default config', () => {
      const template = createAlgorithmTemplate('test_algorithm', '1.0.0');

      expect(template).toEqual({
        key: 'test_algorithm',
        name: 'Test Algorithm',
        category: 'custom',
        description: 'TODO: Add algorithm description',
        version: '1.0.0',
        inputs: [
          {
            key: 'input_data',
            label: 'Input Data',
            description: 'TODO: Describe input data',
            type: 'csv',
            csv: {
              hasHeader: true,
              delimiter: ',',
              columns: [
                {
                  key: 'example_column',
                  type: 'string',
                  description: 'TODO: Describe column',
                },
              ],
            },
          },
        ],
        outputs: [
          {
            key: 'result',
            label: 'Result',
            type: 'score_map',
            entity: 'user',
            description: 'TODO: Describe output',
          },
        ],
      });
    });

    it('should create template with custom category', () => {
      const template = createAlgorithmTemplate('voting_power', '2.1.0', {
        category: 'engagement',
      });

      expect(template).toMatchObject({
        key: 'voting_power',
        name: 'Voting Power',
        category: 'engagement',
        version: '2.1.0',
      });
    });

    it('should create template with custom description', () => {
      const customDescription = 'Calculates user voting power based on activity';
      const template = createAlgorithmTemplate('voting_power', '1.0.0', {
        customDescription,
      });

      expect(template).toMatchObject({
        description: customDescription,
      });
    });

    it('should create template without example input', () => {
      const template = createAlgorithmTemplate('test_algo', '1.0.0', {
        includeExampleInput: false,
      });

      expect(template).toMatchObject({
        inputs: [],
      });
    });

    it('should create template without example output', () => {
      const template = createAlgorithmTemplate('test_algo', '1.0.0', {
        includeExampleOutput: false,
      });

      expect(template).toMatchObject({
        outputs: [],
      });
    });

    it('should create minimal template with no examples', () => {
      const template = createAlgorithmTemplate('minimal_algo', '1.0.0', {
        includeExampleInput: false,
        includeExampleOutput: false,
      });

      expect(template).toEqual({
        key: 'minimal_algo',
        name: 'Minimal Algo',
        category: 'custom',
        description: 'TODO: Add algorithm description',
        version: '1.0.0',
        inputs: [],
        outputs: [],
      });
    });

    it('should create template with all custom options', () => {
      const template = createAlgorithmTemplate('custom_algo', '3.2.1', {
        category: 'quality',
        customDescription: 'Custom algorithm for quality assessment',
        includeExampleInput: false,
        includeExampleOutput: true,
      });

      expect(template).toEqual({
        key: 'custom_algo',
        name: 'Custom Algo',
        category: 'quality',
        description: 'Custom algorithm for quality assessment',
        version: '3.2.1',
        inputs: [],
        outputs: [
          {
            key: 'result',
            label: 'Result',
            type: 'score_map',
            entity: 'user',
            description: 'TODO: Describe output',
          },
        ],
      });
    });

    it('should handle complex algorithm names', () => {
      const template = createAlgorithmTemplate('user_engagement_score_v2', '1.0.0-beta');

      expect(template).toMatchObject({
        key: 'user_engagement_score_v2',
        name: 'User Engagement Score V2',
        version: '1.0.0-beta',
      });
    });

    it('should create consistent output structure', () => {
      const template = createAlgorithmTemplate('test', '1.0.0');

      expect(template).toHaveProperty('key');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('category');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('version');
      expect(template).toHaveProperty('inputs');
      expect(template).toHaveProperty('outputs');

      expect(typeof template.key).toBe('string');
      expect(typeof template.name).toBe('string');
      expect(typeof template.category).toBe('string');
      expect(typeof template.description).toBe('string');
      expect(typeof template.version).toBe('string');
      expect(Array.isArray(template.inputs)).toBe(true);
      expect(Array.isArray(template.outputs)).toBe(true);
    });
  });
});
