import type { AdminViewDto } from "@/lib/api/types"

/**
 * Sort rule for the admins table: the owner is always rendered first,
 * followed by admins in case-insensitive ascending email order.
 *
 * The API already sorts that way, but we re-apply it client-side so the
 * optimistic add path still produces a stable order without waiting for a
 * refetch.
 */
export function sortAdmins(items: readonly AdminViewDto[]): AdminViewDto[] {
  const owner = items.find((row) => row.role === "owner")
  const admins = items
    .filter((row) => row.role !== "owner")
    .slice()
    .sort((a, b) => a.email.toLowerCase().localeCompare(b.email.toLowerCase()))
  return owner ? [owner, ...admins] : admins
}
