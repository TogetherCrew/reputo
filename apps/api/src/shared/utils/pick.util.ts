export function pick<T extends object, K extends keyof T>(object: T, keys: readonly K[]): Partial<Pick<T, K>> {
  return keys.reduce(
    (result, key) => {
      if (object && key in object && object[key] !== undefined) {
        result[key] = object[key];
      }
      return result;
    },
    {} as Partial<Pick<T, K>>,
  );
}
