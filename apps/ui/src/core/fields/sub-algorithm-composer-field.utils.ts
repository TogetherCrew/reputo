import {
  type AlgorithmDefinition,
  getAlgorithmDefinition,
  getAlgorithmDefinitionKeys,
  getAlgorithmDefinitionVersions,
} from "@reputo/reputation-algorithms"

export interface ChildAlgorithmOption {
  key: string
  label: string
}

export function safeGetDefinition(
  key: string,
  version: string
): AlgorithmDefinition | null {
  try {
    return JSON.parse(
      getAlgorithmDefinition({ key, version })
    ) as AlgorithmDefinition
  } catch {
    return null
  }
}

export function safeGetVersions(key: string): string[] {
  try {
    return [...getAlgorithmDefinitionVersions(key)]
  } catch {
    return []
  }
}

/**
 * Returns the list of algorithms available as sub-algorithms, excluding
 * combined ones (they cannot be nested further).
 */
export function getSelectableChildAlgorithms(): ChildAlgorithmOption[] {
  const options: ChildAlgorithmOption[] = []

  for (const key of getAlgorithmDefinitionKeys()) {
    const versions = safeGetVersions(key)
    const latestVersion = versions[versions.length - 1]

    if (!latestVersion) {
      continue
    }

    const definition = safeGetDefinition(key, latestVersion)
    if (!definition || definition.kind === "combined") {
      continue
    }

    options.push({ key, label: definition.name })
  }

  return options.sort((a, b) => a.label.localeCompare(b.label))
}

/** Build a fresh inputs array for the selected child algorithm definition. */
export function buildChildInputsArray(
  definition: AlgorithmDefinition,
  sharedInputKeys: ReadonlyArray<string>
): Array<{ key: string; value: unknown }> {
  return definition.inputs
    .filter((input) => !sharedInputKeys.includes(input.key))
    .map((input) => {
      let defaultValue: unknown = ""

      if (input.type === "boolean") {
        defaultValue = false
      } else if ("default" in input && input.default !== undefined) {
        defaultValue = input.default
      }

      return { key: input.key, value: defaultValue }
    })
}
