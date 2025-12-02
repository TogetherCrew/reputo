[**@reputo/algorithm-validator v0.0.0**](README.md)

***

# @reputo/algorithm-validator v0.0.0

@reputo/algorithm-validator

Shared Zod-based validation library for the Reputo ecosystem.

Provides schema building, payload validation, and CSV content validation
that runs identically on both client and server, ensuring consistent
validation across the entire application.

## Interfaces

- [ColumnDefinition](interfaces/ColumnDefinition.md)
- [CSVConfig](interfaces/CSVConfig.md)
- [BaseInput](interfaces/BaseInput.md)
- [TextInput](interfaces/TextInput.md)
- [NumberInput](interfaces/NumberInput.md)
- [BooleanInput](interfaces/BooleanInput.md)
- [DateInput](interfaces/DateInput.md)
- [EnumInput](interfaces/EnumInput.md)
- [CSVInput](interfaces/CSVInput.md)
- [SliderInput](interfaces/SliderInput.md)
- [Output](interfaces/Output.md)
- [ReputoSchema](interfaces/ReputoSchema.md)
- [ValidationResult](interfaces/ValidationResult.md)
- [CSVValidationResult](interfaces/CSVValidationResult.md)

## Type Aliases

- [CreateAlgorithmPresetInput](type-aliases/CreateAlgorithmPresetInput.md)
- [AlgorithmPresetInputType](type-aliases/AlgorithmPresetInputType.md)
- [ColumnType](type-aliases/ColumnType.md)
- [InputType](type-aliases/InputType.md)
- [Input](type-aliases/Input.md)
- [InferSchemaType](type-aliases/InferSchemaType.md)

## Variables

- [algorithmPresetInputSchema](variables/algorithmPresetInputSchema.md)
- [createAlgorithmPresetSchema](variables/createAlgorithmPresetSchema.md)

## Functions

- [validateCSVContent](functions/validateCSVContent.md)
- [validateCreateAlgorithmPreset](functions/validateCreateAlgorithmPreset.md)
- [validatePayload](functions/validatePayload.md)
- [buildZodSchema](functions/buildZodSchema.md)
