export function isDeepEqual(val1: unknown, val2: unknown): boolean {
  if (val1 === val2) return true;

  if (
    val1 === null ||
    val2 === null ||
    typeof val1 !== "object" ||
    typeof val2 !== "object"
  ) {
    return false;
  }

  if (val1.constructor !== val2.constructor) return false;

  if ("equals" in val1 && typeof val1.equals === "function") {
    return val1.equals(val2);
  }

  if (val1 instanceof Date && val2 instanceof Date) {
    return val1.getTime() === val2.getTime();
  }

  if (val1 instanceof RegExp && val2 instanceof RegExp) {
    return val1.source === val2.source && val1.flags === val2.flags;
  }

  if (val1 instanceof Set && val2 instanceof Set) {
    if (val1.size !== val2.size) return false;
    for (const item of val1) {
      if (!val2.has(item)) return false;
    }
    return true;
  }

  if (val1 instanceof Map && val2 instanceof Map) {
    if (val1.size !== val2.size) return false;
    for (const [key, value] of val1) {
      if (!val2.has(key) || !isDeepEqual(value, val2.get(key))) return false;
    }
    return true;
  }

  const keys1 = Object.keys(val1);
  const keys2 = Object.keys(val2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!(key in val2)) return false;

    if (
      !isDeepEqual(
        val1[key as keyof typeof val1],
        val2[key as keyof typeof val2],
      )
    )
      return false;
  }

  return true;
}
