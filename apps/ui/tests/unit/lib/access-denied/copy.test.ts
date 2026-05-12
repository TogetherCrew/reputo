import { describe, expect, it } from "vitest"
import {
  normaliseReason,
  resolveAccessDeniedCopy,
} from "../../../../src/lib/access-denied/copy"

describe("normaliseReason", () => {
  it("returns the reason verbatim when it is a known value", () => {
    expect(normaliseReason("not_allowlisted")).toBe("not_allowlisted")
    expect(normaliseReason("email_unverified")).toBe("email_unverified")
    expect(normaliseReason("revoked")).toBe("revoked")
  })

  it("returns 'unknown' for missing, empty, or unrecognised values", () => {
    expect(normaliseReason(undefined)).toBe("unknown")
    expect(normaliseReason(null)).toBe("unknown")
    expect(normaliseReason("")).toBe("unknown")
    expect(normaliseReason("hacked")).toBe("unknown")
    expect(normaliseReason(123)).toBe("unknown")
  })
})

describe("resolveAccessDeniedCopy", () => {
  it("maps not_allowlisted to the retry link", () => {
    const copy = resolveAccessDeniedCopy("not_allowlisted")

    expect(copy.reason).toBe("not_allowlisted")
    expect(copy.description).toMatch(/approved list/i)
    expect(copy.cta).toEqual({
      kind: "link",
      label: "Back to sign in",
      href: "/login",
    })
  })

  it("maps email_unverified to a /login retry link", () => {
    const copy = resolveAccessDeniedCopy("email_unverified")

    expect(copy.reason).toBe("email_unverified")
    expect(copy.description).toMatch(/DeepID/i)
    expect(copy.cta).toEqual({
      kind: "link",
      label: "Back to sign in",
      href: "/login",
    })
  })

  it("maps revoked to the retry link", () => {
    const copy = resolveAccessDeniedCopy("revoked")

    expect(copy.reason).toBe("revoked")
    expect(copy.description).toMatch(/revoked/i)
    expect(copy.cta).toEqual({
      kind: "link",
      label: "Back to sign in",
      href: "/login",
    })
  })

  it("uses the generic default copy for missing or unknown reasons", () => {
    const missing = resolveAccessDeniedCopy(undefined)
    const unknown = resolveAccessDeniedCopy("totally-made-up")

    for (const copy of [missing, unknown]) {
      expect(copy.reason).toBe("unknown")
      expect(copy.title).toBe("Access denied")
      expect(copy.cta).toEqual({
        kind: "link",
        label: "Back to sign in",
        href: "/login",
      })
    }
  })
})
