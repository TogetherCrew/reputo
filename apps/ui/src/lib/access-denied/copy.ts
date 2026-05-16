/**
 * Reason → copy mapping for the public `/access-denied` route.
 *
 * The API redirects rejected DeepID users here with a `?reason=` query string.
 * Unknown / missing values fall through to a generic message so the page never
 * 404s on a value the backend may add later.
 */

export type AccessDeniedReason =
  | "not_allowlisted"
  | "email_unverified"
  | "revoked"
  | "unknown"

export type AccessDeniedCta =
  | { kind: "link"; label: string; href: string }
  | { kind: "none" }

export interface AccessDeniedCopy {
  reason: AccessDeniedReason
  title: string
  description: string
  cta: AccessDeniedCta
}

const KNOWN_REASONS: ReadonlySet<AccessDeniedReason> = new Set([
  "not_allowlisted",
  "email_unverified",
  "revoked",
])

export function normaliseReason(input: unknown): AccessDeniedReason {
  if (typeof input !== "string") return "unknown"
  return KNOWN_REASONS.has(input as AccessDeniedReason)
    ? (input as AccessDeniedReason)
    : "unknown"
}

const RETRY_LINK: AccessDeniedCta = {
  kind: "link",
  label: "Back to sign in",
  href: "/login",
}

export function resolveAccessDeniedCopy(rawReason: unknown): AccessDeniedCopy {
  const reason = normaliseReason(rawReason)

  switch (reason) {
    case "not_allowlisted":
      return {
        reason,
        title: "Access restricted",
        description:
          "Reputo is restricted. You're not on the approved list yet. Contact your administrator to request access.",
        cta: RETRY_LINK,
      }
    case "email_unverified":
      return {
        reason,
        title: "Email not verified",
        description:
          "Your DeepID email is not verified. Verify it in DeepID and try again.",
        cta: { kind: "link", label: "Back to sign in", href: "/login" },
      }
    case "revoked":
      return {
        reason,
        title: "Access revoked",
        description:
          "Your access has been revoked. Contact your administrator if you believe this is a mistake.",
        cta: RETRY_LINK,
      }
    default:
      return {
        reason: "unknown",
        title: "Access denied",
        description:
          "You don't have access to Reputo right now. Try signing in again, or contact your administrator if the issue persists.",
        cta: { kind: "link", label: "Back to sign in", href: "/login" },
      }
  }
}
