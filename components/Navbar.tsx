"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/applications", label: "Candidatures" },
    { href: "/propositions-cabinet", label: "Propositions cabinet" },
    { href: "/companies", label: "Entreprises" },
    { href: "/contacts", label: "Contacts" },
    { href: "/documents", label: "Documents" },
    { href: "/calendar", label: "Calendrier" },
    { href: "/analytics", label: "Analytics" },
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"))

  const linkClass = (href: string) =>
    isActive(href)
      ? "border-blue-500 text-gray-900 bg-blue-50"
      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600 flex-shrink-0">
              JobSearch
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(item.href) ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="hidden sm:block text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Déconnexion
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white">
          <div className="pt-2 pb-3 space-y-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-base font-medium border-l-4 ${linkClass(item.href)}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut({ callbackUrl: "/login" })
                }}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
