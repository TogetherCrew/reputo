[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / AlgorithmDependency

# Interface: AlgorithmDependency

Defined in: [shared/types/algorithm.ts:145](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/reputation-algorithms/src/shared/types/algorithm.ts#L145)

Describes an external dependency that an algorithm requires.
Dependencies are resolved before algorithm execution.
Algorithms fetch the data using predictable S3 key patterns.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:147](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/reputation-algorithms/src/shared/types/algorithm.ts#L147)

Unique identifier for the dependency (e.g., 'deepfunding-portal-api')
