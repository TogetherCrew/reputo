[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / algorithmPresetInputSchema

# Variable: algorithmPresetInputSchema

> `const` **algorithmPresetInputSchema**: `ZodObject`\<\{ `key`: `ZodString`; `value`: `ZodUnknown`; \}, `$strip`\>

Defined in: [packages/algorithm-validator/src/schemas/algorithm-preset.ts:15](https://github.com/TogetherCrew/reputo/blob/a6f073cc8d9883039b44c79167c065391c6b81c1/packages/algorithm-validator/src/schemas/algorithm-preset.ts#L15)

Zod schema for validating a single algorithm preset input.

Each input must have a key (string) and a value (any non-null/undefined value).
