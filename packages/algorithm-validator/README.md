# @reputo/algorithm-validator

Shared validation workspace package used by the API and UI.

## Public Surface

- `buildZodSchema` and `validatePayload` for algorithm input validation
- `validateCSVContent` for CSV checks in both Node.js and browser runtimes
- `createAlgorithmPresetSchema` and `validateCreateAlgorithmPreset` for preset payloads
- shared types such as `AlgorithmDefinition`, `CsvIoItem`, `ValidationResult`, and `CSVValidationResult`

## Commands

```bash
pnpm --filter @reputo/algorithm-validator build
pnpm --filter @reputo/algorithm-validator test
pnpm --filter @reputo/algorithm-validator typecheck
pnpm --filter @reputo/algorithm-validator docs
```

## Docs

- Generated API docs: [docs/README.md](docs/README.md)
