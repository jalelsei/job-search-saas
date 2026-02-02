import { NextResponse } from "next/server"

// Edge-compatible: no Node deps (no auth(), no crypto).
// We only check for the NextAuth session cookie; real auth is validated in API/pages.
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
]

function hasSessionCookie(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? ""
  return SESSION_COOKIE_NAMES.some((name) =>
    cookieHeader.includes(`${name}=`)
  )
}

export default function middleware(request: Request) {
  const { pathname } = new URL(request.url)
  const isLoggedIn = hasSessionCookie(request)

  const publicRoutes = ["/login", "/register"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
