[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / algorithmPresetInputSchema

# Variable: algorithmPresetInputSchema

> `const` **algorithmPresetInputSchema**: `ZodObject`\<\{ `key`: `ZodString`; `value`: `ZodUnknown`; \}, `$strip`\>

Defined in: [packages/algorithm-validator/src/schemas/algorithm-preset.ts:15](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/algorithm-validator/src/schemas/algorithm-preset.ts#L15)

Zod schema for validating a single algorithm preset input.

Each input must have a key (string) and a value (any non-null/undefined value).
