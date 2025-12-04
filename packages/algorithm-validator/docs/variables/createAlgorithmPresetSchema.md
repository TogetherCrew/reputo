[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / createAlgorithmPresetSchema

# Variable: createAlgorithmPresetSchema

> `const` **createAlgorithmPresetSchema**: `ZodObject`\<\{ `key`: `ZodString`; `version`: `ZodString`; `inputs`: `ZodArray`\<`ZodObject`\<\{ `key`: `ZodString`; `value`: `ZodUnknown`; \}, `$strip`\>\>; `name`: `ZodOptional`\<`ZodString`\>; `description`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [packages/algorithm-validator/src/schemas/algorithm-preset.ts:32](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/algorithm-validator/src/schemas/algorithm-preset.ts#L32)

Zod schema for validating algorithm preset creation payloads.

Validates the complete structure required to create an algorithm preset:
- key: Algorithm key (required, non-empty string)
- version: Algorithm version (required, non-empty string)
- inputs: Array of inputs (required, at least one)
- name: Optional name (3-100 characters if provided)
- description: Optional description (10-500 characters if provided)
