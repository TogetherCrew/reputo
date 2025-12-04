[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / LegacyParsedStorageKey

# ~~Interface: LegacyParsedStorageKey~~

Defined in: [shared/types/types.ts:130](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L130)

## Deprecated

Use ParsedStorageKey with type discrimination instead.
Legacy interface for backward compatibility.

## Properties

### ~~filename~~

> **filename**: `string`

Defined in: [shared/types/types.ts:136](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L136)

Full filename including extension.

#### Example

```ts
'data.csv'
```

***

### ~~ext~~

> **ext**: `string`

Defined in: [shared/types/types.ts:143](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L143)

File extension without the dot.

#### Example

```ts
'csv'
```

***

### ~~timestamp~~

> **timestamp**: `number`

Defined in: [shared/types/types.ts:149](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L149)

Unix timestamp (seconds since epoch) when the key was generated.
Only present for upload keys.
