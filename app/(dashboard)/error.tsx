"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error.message, error.digest)
  }, [error])

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Une erreur est survenue
      </h1>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        Le chargement a échoué. Vérifiez votre connexion et les variables d&apos;environnement (base de données, auth) sur Netlify.
      </p>
      {error.digest && (
        <p className="text-sm text-gray-400 mb-4">Digest : {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
        <Link
          href="/login"
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
