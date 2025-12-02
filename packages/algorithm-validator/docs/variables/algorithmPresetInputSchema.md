[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / algorithmPresetInputSchema

# Variable: algorithmPresetInputSchema

> `const` **algorithmPresetInputSchema**: `ZodObject`\<\{ `key`: `ZodString`; `value`: `ZodUnknown`; \}, `$strip`\>

Defined in: [packages/algorithm-validator/src/schemas/algorithm-preset.ts:15](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/schemas/algorithm-preset.ts#L15)

Zod schema for validating a single algorithm preset input.

Each input must have a key (string) and a value (any non-null/undefined value).
