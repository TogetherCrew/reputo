[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / algorithmPresetInputSchema

# Variable: algorithmPresetInputSchema

> `const` **algorithmPresetInputSchema**: `z.ZodObject`\<\{ `key`: `z.ZodString`; `value`: `z.ZodUnknown`; \}\>

Defined in: [packages/algorithm-validator/src/schemas/algorithm-preset.ts:15](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/algorithm-validator/src/schemas/algorithm-preset.ts#L15)

Zod schema for validating a single algorithm preset input.

Each input must have a key (string) and a value (any non-null/undefined value).
