[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ParsedStorageKey

# Interface: ParsedStorageKey

Defined in: [shared/types/types.ts:47](https://github.com/TogetherCrew/reputo/blob/a6f073cc8d9883039b44c79167c065391c6b81c1/packages/storage/src/shared/types/types.ts#L47)

Parsed components of a storage key.
Extracted from the key path structure.

## Properties

### filename

> **filename**: `string`

Defined in: [shared/types/types.ts:53](https://github.com/TogetherCrew/reputo/blob/a6f073cc8d9883039b44c79167c065391c6b81c1/packages/storage/src/shared/types/types.ts#L53)

Full filename including extension.

#### Example

```ts
'data.csv'
```

***

### ext

> **ext**: `string`

Defined in: [shared/types/types.ts:60](https://github.com/TogetherCrew/reputo/blob/a6f073cc8d9883039b44c79167c065391c6b81c1/packages/storage/src/shared/types/types.ts#L60)

File extension without the dot.

#### Example

```ts
'csv'
```

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/types.ts:65](https://github.com/TogetherCrew/reputo/blob/a6f073cc8d9883039b44c79167c065391c6b81c1/packages/storage/src/shared/types/types.ts#L65)

Unix timestamp (seconds since epoch) when the key was generated.
