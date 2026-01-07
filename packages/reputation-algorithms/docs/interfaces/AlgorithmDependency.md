[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / AlgorithmDependency

# Interface: AlgorithmDependency

Defined in: [shared/types/algorithm.ts:145](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L145)

Describes an external dependency that an algorithm requires.
Dependencies are resolved before algorithm execution.
Algorithms fetch the data using predictable S3 key patterns.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:147](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L147)

Unique identifier for the dependency (e.g., 'deepfunding-portal-api')
