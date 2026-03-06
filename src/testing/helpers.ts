/** Shared helpers for proto JSON test fixture factories. */

let counter = 0;

/** Generate a sequential correlation ID (e.g., "corr-test-001"). */
export function makeCorrelationId(): string {
  counter++;
  return `corr-test-${String(counter).padStart(3, "0")}`;
}

/** Reset the correlation ID counter (useful between test runs). */
export function resetCorrelationCounter(): void {
  counter = 0;
}

/** Generate an ISO 8601 timestamp string. */
export function makeTimestamp(date?: Date): string {
  return (date ?? new Date("2026-03-06T10:00:00Z")).toISOString();
}

/**
 * Shallow merge defaults with overrides, omitting undefined values.
 * Proto JSON convention: absent fields are omitted, never null.
 */
export function mergeDefaults<T extends Record<string, unknown>>(
  defaults: T,
  overrides?: Partial<T>,
): T {
  if (!overrides) return { ...defaults };
  const result = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete (result as Record<string, unknown>)[key];
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}
