import { describe, expect, it } from "vitest";
import { ErrorDomain, parseOrThrow, safeParse } from "../../src/zod/index.js";

describe("ErrorDomain", () => {
  const valid = { code: "NOT_FOUND", message: "Resource not found" };

  it("accepts valid error without details", () => {
    expect(parseOrThrow(ErrorDomain, valid)).toEqual(valid);
  });

  it("accepts valid error with details", () => {
    const withDetails = { ...valid, details: { resource: "controller-123" } };
    expect(parseOrThrow(ErrorDomain, withDetails)).toEqual(withDetails);
  });

  it("rejects missing code", () => {
    const result = safeParse(ErrorDomain, { message: "oops" });
    expect(result.success).toBe(false);
  });

  it("rejects empty code", () => {
    const result = safeParse(ErrorDomain, { code: "", message: "oops" });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = safeParse(ErrorDomain, { code: "ERR" });
    expect(result.success).toBe(false);
  });

  it("rejects empty message", () => {
    const result = safeParse(ErrorDomain, { code: "ERR", message: "" });
    expect(result.success).toBe(false);
  });
});
