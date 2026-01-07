[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / LegacyParsedStorageKey

# ~~Interface: LegacyParsedStorageKey~~

Defined in: [shared/types/types.ts:201](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L201)

## Deprecated

Use ParsedStorageKey with type discrimination instead.
Legacy interface for backward compatibility.

## Properties

### ~~filename~~

> **filename**: `string`

Defined in: [shared/types/types.ts:207](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L207)

Full filename including extension.

#### Example

```ts
'data.csv'
```

***

### ~~ext~~

> **ext**: `string`

Defined in: [shared/types/types.ts:214](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L214)

File extension without the dot.

#### Example

```ts
'csv'
```

***

### ~~timestamp~~

> **timestamp**: `number`

Defined in: [shared/types/types.ts:220](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L220)

Unix timestamp (seconds since epoch) when the key was generated.
Only present for upload keys.
