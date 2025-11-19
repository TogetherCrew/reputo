[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ParsedStorageKey

# Interface: ParsedStorageKey

Defined in: shared/types/metadata.types.ts:23

Parsed components of a storage key.
Extracted from the key path structure.

Storage keys follow the convention: `uploads/{timestamp}/{filename}.{ext}`
This interface represents the parsed components of such a key.

## Example

```typescript
const parsed: ParsedStorageKey = {
  filename: 'data.csv',
  ext: 'csv',
  timestamp: 1732147200,
};
```

## Properties

### filename

> **filename**: `string`

Defined in: shared/types/metadata.types.ts:29

Full filename including extension.

#### Example

```ts
'data.csv'
```

***

### ext

> **ext**: `string`

Defined in: shared/types/metadata.types.ts:36

File extension without the dot.

#### Example

```ts
'csv'
```

***

### timestamp

> **timestamp**: `number`

Defined in: shared/types/metadata.types.ts:43

Unix timestamp (seconds since epoch) when the key was generated.

#### Example

```ts
1732147200
```
