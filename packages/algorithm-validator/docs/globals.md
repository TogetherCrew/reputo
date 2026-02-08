[**@reputo/algorithm-validator v0.0.0**](README.md)

***

# @reputo/algorithm-validator v0.0.0

@reputo/algorithm-validator

Shared Zod-based validation library for the Reputo ecosystem.

Provides schema building, payload validation, and CSV content validation
that runs identically on both client and server, ensuring consistent
validation across the entire application.

This package is self-contained and has no dependencies on other Reputo
packages. Algorithm definition types are included for validation purposes.

## Interfaces

- [CsvIoItem](interfaces/CsvIoItem.md)
- [AlgorithmDefinition](interfaces/AlgorithmDefinition.md)
- [ValidationResult](interfaces/ValidationResult.md)
- [CSVValidationResult](interfaces/CSVValidationResult.md)

## Type Aliases

- [CreateAlgorithmPresetInput](type-aliases/CreateAlgorithmPresetInput.md)
- [AlgorithmPresetInputType](type-aliases/AlgorithmPresetInputType.md)
- [AlgorithmCategory](type-aliases/AlgorithmCategory.md)
- [IoType](type-aliases/IoType.md)
- [IoItem](type-aliases/IoItem.md)
- [AlgorithmRuntime](type-aliases/AlgorithmRuntime.md)
- [InferSchemaType](type-aliases/InferSchemaType.md)

## Variables

- [algorithmPresetInputSchema](variables/algorithmPresetInputSchema.md)
- [createAlgorithmPresetSchema](variables/createAlgorithmPresetSchema.md)

## Functions

- [validateCSVContent](functions/validateCSVContent.md)
- [validateCreateAlgorithmPreset](functions/validateCreateAlgorithmPreset.md)
- [validatePayload](functions/validatePayload.md)
- [buildZodSchema](functions/buildZodSchema.md)
