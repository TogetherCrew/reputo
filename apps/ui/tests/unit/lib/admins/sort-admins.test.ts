import { describe, expect, it } from "vitest"
import { sortAdmins } from "../../../../src/lib/admins/sort-admins"
import type { AdminViewDto } from "../../../../src/lib/api/types"

function admin(
  email: string,
  overrides: Partial<AdminViewDto> = {}
): AdminViewDto {
  return {
    email,
    role: "admin",
    invitedAt: "2026-05-12T10:00:00.000Z",
    ...overrides,
  }
}

describe("sortAdmins", () => {
  it("places the owner row first regardless of input order", () => {
    const input = [
      admin("zoe@example.com"),
      admin("owner@example.com", { role: "owner" }),
      admin("alice@example.com"),
    ]

    const result = sortAdmins(input)

    expect(result.map((row) => row.email)).toEqual([
      "owner@example.com",
      "alice@example.com",
      "zoe@example.com",
    ])
  })

  it("sorts admin rows alphabetically and case-insensitively", () => {
    const input = [
      admin("Charlie@example.com"),
      admin("alice@example.com"),
      admin("bob@example.com"),
    ]

    const result = sortAdmins(input)

    expect(result.map((row) => row.email)).toEqual([
      "alice@example.com",
      "bob@example.com",
      "Charlie@example.com",
    ])
  })

  it("returns only admin rows (sorted) when there is no owner", () => {
    const input = [admin("zoe@example.com"), admin("alice@example.com")]

    expect(sortAdmins(input).map((row) => row.email)).toEqual([
      "alice@example.com",
      "zoe@example.com",
    ])
  })

  it("returns an empty array for empty input", () => {
    expect(sortAdmins([])).toEqual([])
  })

  it("does not mutate the input array", () => {
    const input = [
      admin("zoe@example.com"),
      admin("alice@example.com"),
      admin("owner@example.com", { role: "owner" }),
    ]
    const snapshot = input.map((row) => row.email)

    sortAdmins(input)

    expect(input.map((row) => row.email)).toEqual(snapshot)
  })
})
