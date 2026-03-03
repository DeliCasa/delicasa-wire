import type { z, ZodType } from "zod";

export { ErrorDomain } from "./errors.js";
export { LocationDomain, ControllerDomain } from "./controller.js";
export {
  PurchaseItemDomain,
  PurchaseSessionDomain,
} from "./purchase-session.js";

/**
 * Parse a value against a Zod schema, throwing on failure.
 * Use at trust boundaries where invalid data should halt execution.
 */
export function parseOrThrow<T>(schema: ZodType<T>, value: unknown): T {
  return schema.parse(value);
}

/**
 * Safely parse a value against a Zod schema, returning a result object.
 * Use at trust boundaries where you want to handle errors gracefully.
 */
export function safeParse<T>(
  schema: ZodType<T>,
  value: unknown,
): z.SafeParseReturnType<unknown, T> {
  return schema.safeParse(value);
}
