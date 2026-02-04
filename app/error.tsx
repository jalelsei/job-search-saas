"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error.message, error.digest)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Une erreur est survenue
      </h1>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        Réessayez ou retournez à l&apos;accueil. Si le problème persiste, vérifiez les logs serveur (Netlify).
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
          href="/"
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Accueil
        </Link>
      </div>
    </div>
  )
}
