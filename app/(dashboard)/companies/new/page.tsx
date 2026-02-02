"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewCompanyPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    size: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/companies")
      } else {
        const error = await response.json()
        alert(error.error || "Erreur lors de la création")
      }
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Nouvelle entreprise
      </h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Site web
          </label>
          <input
            type="url"
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Secteur d'activité
          </label>
          <input
            type="text"
            id="industry"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ex: Technologie, Finance, etc."
          />
        </div>

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">
            Taille
          </label>
          <select
            id="size"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sélectionner</option>
            <option value="1-10">1-10 employés</option>
            <option value="11-50">11-50 employés</option>
            <option value="51-200">51-200 employés</option>
            <option value="201-500">201-500 employés</option>
            <option value="501-1000">501-1000 employés</option>
            <option value="1000+">1000+ employés</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Création..." : "Créer"}
          </button>
        </div>
      </form>
    </div>
  )
}
