[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / createAlgorithmPresetSchema

# Variable: createAlgorithmPresetSchema

> `const` **createAlgorithmPresetSchema**: `z.ZodObject`\<\{ `key`: `z.ZodString`; `version`: `z.ZodString`; `inputs`: `z.ZodArray`\<`z.ZodObject`\<\{ `key`: `z.ZodString`; `value`: `z.ZodUnknown`; \}\>\>; `name`: `z.ZodOptional`\<`z.ZodString`\>; `description`: `z.ZodOptional`\<`z.ZodString`\>; \}\>

Defined in: [packages/algorithm-validator/src/schemas/algorithm-preset.ts:35](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/algorithm-validator/src/schemas/algorithm-preset.ts#L35)

Zod schema for validating algorithm preset creation payloads.

Validates the complete structure required to create an algorithm preset:
- key: Algorithm key (required, non-empty string)
- version: Algorithm version (required, non-empty string)
- inputs: Array of inputs (required, at least one)
- name: Optional name (3-100 characters if provided)
- description: Optional description (10-500 characters if provided)
