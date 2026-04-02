import { NextRequest } from "next/server"
import { afterEach, describe, expect, it, vi } from "vitest"

const originalCookieName = process.env.AUTH_COOKIE_NAME

function createRequest(pathname: string, cookie?: string): NextRequest {
  return new NextRequest(`https://reputo.local${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  })
}

async function loadMiddleware(cookieName?: string) {
  vi.resetModules()

  if (cookieName == null) {
    delete process.env.AUTH_COOKIE_NAME
  } else {
    process.env.AUTH_COOKIE_NAME = cookieName
  }

  return import("../../src/middleware")
}

afterEach(() => {
  vi.resetModules()

  if (originalCookieName == null) {
    delete process.env.AUTH_COOKIE_NAME
  } else {
    process.env.AUTH_COOKIE_NAME = originalCookieName
  }
})

describe("ui middleware", () => {
  it("keeps the login route public even when the auth cookie is present", async () => {
    const { middleware } = await loadMiddleware("reputo_auth_session")

    const response = middleware(
      createRequest("/login", "reputo_auth_session=session-123")
    )

    expect(response.headers.get("x-middleware-next")).toBe("1")
    expect(response.headers.get("location")).toBeNull()
  })

  it("redirects protected routes to login when the auth cookie is missing", async () => {
    const { middleware } = await loadMiddleware("reputo_auth_session")

    const response = middleware(createRequest("/dashboard"))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("https://reputo.local/login")
  })

  it("uses the backend auth cookie name as the default fallback", async () => {
    const { middleware } = await loadMiddleware()

    const response = middleware(
      createRequest("/dashboard", "reputo_auth_session=session-123")
    )

    expect(response.headers.get("x-middleware-next")).toBe("1")
    expect(response.headers.get("location")).toBeNull()
  })
})
