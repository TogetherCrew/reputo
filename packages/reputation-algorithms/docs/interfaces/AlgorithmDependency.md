[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / AlgorithmDependency

# Interface: AlgorithmDependency

Defined in: [shared/types/algorithm.ts:145](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/reputation-algorithms/src/shared/types/algorithm.ts#L145)

Describes an external dependency that an algorithm requires.
Dependencies are resolved before algorithm execution.
Algorithms fetch the data using predictable S3 key patterns.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:147](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/reputation-algorithms/src/shared/types/algorithm.ts#L147)

Unique identifier for the dependency (e.g., 'deepfunding-portal-api')
