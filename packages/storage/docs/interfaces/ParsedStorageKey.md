[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ParsedStorageKey

# Interface: ParsedStorageKey

Defined in: shared/types/types.ts:47

Parsed components of a storage key.
Extracted from the key path structure.

## Properties

### filename

> **filename**: `string`

Defined in: shared/types/types.ts:53

Full filename including extension.

#### Example

```ts
'data.csv'
```

***

### ext

> **ext**: `string`

Defined in: shared/types/types.ts:60

File extension without the dot.

#### Example

```ts
'csv'
```

***

### timestamp

> **timestamp**: `number`

Defined in: shared/types/types.ts:65

Unix timestamp (seconds since epoch) when the key was generated.
