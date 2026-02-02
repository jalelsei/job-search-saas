import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Routes publiques
  const publicRoutes = ["/login", "/register"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Si l'utilisateur est connecté et essaie d'accéder aux pages de connexion
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
