"use client"

import { useRouter } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

// ── Types ──────────────────────────────────────────────────────────────

export interface AuthSessionUser {
  id: string
  did: string
  email?: string
  emailVerified: boolean
  name?: string
  givenName?: string
  familyName?: string
  picture?: string
  walletAddresses: string[]
  kycVerified: boolean
  amr: string[]
}

export interface AuthSession {
  authenticated: boolean
  provider?: string
  expiresAt?: string
  scope?: string[]
  user?: AuthSessionUser
}

interface AuthContextValue {
  /** The current session, or `null` while the bootstrap request is in flight. */
  session: AuthSession | null
  /** True until the initial `/me` call resolves or rejects. */
  loading: boolean
  /** Sign out: hits the logout endpoint, clears state, and navigates to /login. */
  logout: () => Promise<void>
}

// ── Context ────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────

export function AuthBootstrapProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Bootstrap: fetch the current session from the backend.
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const res = await fetch("/api/v1/auth/deep-id/me", {
          credentials: "include",
        })

        if (!res.ok) {
          // 401 or any non-ok → no valid session
          if (!cancelled) {
            setSession(null)
            router.replace("/login")
          }
          return
        }

        const data: AuthSession = await res.json()

        if (!cancelled) {
          if (!data.authenticated) {
            setSession(null)
            router.replace("/login")
          } else {
            setSession(data)
          }
        }
      } catch {
        // Network error → treat as unauthenticated
        if (!cancelled) {
          setSession(null)
          router.replace("/login")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [router])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/v1/auth/deep-id/logout", {
        method: "POST",
        credentials: "include",
      })
    } finally {
      setSession(null)
      router.replace("/login")
    }
  }, [router])

  const value = useMemo<AuthContextValue>(
    () => ({ session, loading, logout }),
    [session, loading, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useAuthSession(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error(
      "useAuthSession must be used within an AuthBootstrapProvider"
    )
  }
  return ctx
}
