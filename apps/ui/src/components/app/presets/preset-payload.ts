interface PresetPayloadAlgorithmInput {
  key: string
  type: string
}

interface PresetPayloadInput {
  key: string
  value?: unknown
}

const NUMERIC_INPUT_TYPES = new Set(["number", "integer", "slider"])

/** Normalize numeric value: "1,2" (locale) -> number 1.2 for API validity. */
export function normalizeNumericPresetValue(value: unknown): unknown {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value !== "string") {
    return value
  }

  const trimmed = value.trim()
  if (trimmed === "") {
    return value
  }

  const normalized = trimmed.replace(/,/g, ".")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : value
}

/**
 * Normalize a sub_algorithm entry into the API payload shape:
 * `{ algorithm_key, algorithm_version, weight, inputs: [{ key, value }] }`.
 * File values from pending uploads are coerced to empty strings.
 */
export function normalizeSubAlgorithmEntries(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value
  }

  return value.map((entry) => {
    if (typeof entry !== "object" || entry === null) {
      return entry
    }

    const row = entry as Record<string, unknown>
    const rawInputs = Array.isArray(row.inputs) ? row.inputs : []
    const inputs = rawInputs.map((item) => {
      if (typeof item !== "object" || item === null) {
        return item
      }

      const record = item as Record<string, unknown>
      const inputValue = record.value
      const serialized = inputValue instanceof File ? "" : (inputValue ?? "")

      return { key: record.key, value: serialized }
    })
    const weight =
      typeof row.weight === "number"
        ? row.weight
        : Number(normalizeNumericPresetValue(row.weight))

    return {
      algorithm_key: row.algorithm_key ?? "",
      algorithm_version: row.algorithm_version ?? "",
      weight: Number.isFinite(weight) ? weight : row.weight,
      inputs,
    }
  })
}

function findExistingInputValue(
  key: string,
  existingInputs?: ReadonlyArray<PresetPayloadInput>
): unknown {
  return existingInputs?.find((input) => input.key === key)?.value
}

function serializePresetInputValue(args: {
  input: PresetPayloadAlgorithmInput
  formValue: unknown
  fallbackValue: unknown
}): unknown {
  const { input, formValue, fallbackValue } = args

  if (formValue instanceof File) {
    return ""
  }

  if (input.type === "array") {
    if (Array.isArray(formValue)) {
      return formValue
    }

    return (
      fallbackValue ??
      (formValue !== undefined && formValue !== null ? formValue : "")
    )
  }

  if (input.type === "sub_algorithm") {
    const source = Array.isArray(formValue)
      ? formValue
      : (fallbackValue ?? formValue)
    return normalizeSubAlgorithmEntries(source)
  }

  if (formValue !== undefined && formValue !== null && formValue !== "") {
    return NUMERIC_INPUT_TYPES.has(input.type)
      ? normalizeNumericPresetValue(formValue)
      : formValue
  }

  const raw = fallbackValue ?? ""
  return NUMERIC_INPUT_TYPES.has(input.type)
    ? normalizeNumericPresetValue(raw)
    : raw
}

export function buildPresetInputsFromForm(args: {
  algorithmInputs: ReadonlyArray<PresetPayloadAlgorithmInput>
  data: Record<string, unknown>
  existingInputs?: ReadonlyArray<PresetPayloadInput>
}): PresetPayloadInput[] {
  return args.algorithmInputs.map((input) => ({
    key: input.key,
    value: serializePresetInputValue({
      input,
      formValue: args.data[input.key],
      fallbackValue: findExistingInputValue(input.key, args.existingInputs),
    }),
  }))
}
