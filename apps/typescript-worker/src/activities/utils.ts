/**
 * Resolve a specific input location from the payload's inputLocations array.
 *
 * @param inputLocations - Array of input location entries from the workflow payload
 * @param inputKey - The logical input key to look up
 * @returns The storage key (string) for the requested input
 * @throws Error if the input key is missing or has an invalid value type
 */
export function getInputLocation(
    inputLocations: Array<{ key: string; value: unknown }>,
    inputKey: string
): string {
    const entry = inputLocations.find((i) => i.key === inputKey)
    if (!entry) {
        throw new Error(`Missing input "${inputKey}"`)
    }
    if (typeof entry.value !== 'string') {
        throw new Error(`Input "${inputKey}" has invalid value type`)
    }
    return entry.value
}
