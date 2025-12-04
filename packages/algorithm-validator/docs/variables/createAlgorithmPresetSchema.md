[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / createAlgorithmPresetSchema

# Variable: createAlgorithmPresetSchema

> `const` **createAlgorithmPresetSchema**: `ZodObject`\<\{ `key`: `ZodString`; `version`: `ZodString`; `inputs`: `ZodArray`\<`ZodObject`\<\{ `key`: `ZodString`; `value`: `ZodUnknown`; \}, `$strip`\>\>; `name`: `ZodOptional`\<`ZodString`\>; `description`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [packages/algorithm-validator/src/schemas/algorithm-preset.ts:32](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/algorithm-validator/src/schemas/algorithm-preset.ts#L32)

Zod schema for validating algorithm preset creation payloads.

Validates the complete structure required to create an algorithm preset:
- key: Algorithm key (required, non-empty string)
- version: Algorithm version (required, non-empty string)
- inputs: Array of inputs (required, at least one)
- name: Optional name (3-100 characters if provided)
- description: Optional description (10-500 characters if provided)
