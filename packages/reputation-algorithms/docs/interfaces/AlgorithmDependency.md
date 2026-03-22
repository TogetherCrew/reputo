[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / AlgorithmDependency

# Interface: AlgorithmDependency

Defined in: [shared/types/algorithm.ts:190](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L190)

Describes an external dependency that an algorithm requires.
Dependencies are resolved before algorithm execution.
Algorithms fetch the data using predictable S3 key patterns.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:192](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L192)

Unique identifier for the dependency (e.g., 'deepfunding-portal-api')
