"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [application, setApplication] = useState<any>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    position: "",
    status: "TO_APPLY",
    companyId: "",
    appliedAt: "",
    interviewAt: "",
    deadline: "",
    notes: "",
  })

  useEffect(() => {
    fetchApplication()
    fetchCompanies()
  }, [params.id])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setApplication(data)
        setFormData({
          position: data.position,
          status: data.status,
          companyId: data.companyId,
          appliedAt: data.appliedAt ? new Date(data.appliedAt).toISOString().split("T")[0] : "",
          interviewAt: data.interviewAt ? new Date(data.interviewAt).toISOString().slice(0, 16) : "",
          deadline: data.deadline ? new Date(data.deadline).toISOString().split("T")[0] : "",
          notes: data.notes || "",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/applications/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchApplication()
        setEditing(false)
      } else {
        const error = await response.json()
        alert(error.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette candidature ?")) {
      return
    }

    try {
      const response = await fetch(`/api/applications/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/applications")
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      alert("Une erreur est survenue")
    }
  }

  const statusMap: Record<string, string> = {
    TO_APPLY: "À postuler",
    APPLIED: "Candidature envoyée",
    INTERVIEW: "Entretien",
    REJECTED: "Refus",
    ACCEPTED: "Accepté",
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  if (!application) {
    return <div className="p-6">Candidature non trouvée</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/applications"
          className="text-blue-600 hover:text-blue-500"
        >
          ← Retour
        </Link>
        <div className="space-x-2">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Modifier la candidature</h1>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Poste *
            </label>
            <input
              type="text"
              id="position"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
              Entreprise *
            </label>
            <select
              id="companyId"
              required
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="TO_APPLY">À postuler</option>
              <option value="APPLIED">Candidature envoyée</option>
              <option value="INTERVIEW">Entretien</option>
              <option value="REJECTED">Refus</option>
              <option value="ACCEPTED">Accepté</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                Deadline
              </label>
              <input
                type="date"
                id="deadline"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="appliedAt" className="block text-sm font-medium text-gray-700">
                Date d'envoi
              </label>
              <input
                type="date"
                id="appliedAt"
                value={formData.appliedAt}
                onChange={(e) => setFormData({ ...formData, appliedAt: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="interviewAt" className="block text-sm font-medium text-gray-700">
                Date d'entretien
              </label>
              <input
                type="datetime-local"
                id="interviewAt"
                value={formData.interviewAt}
                onChange={(e) => setFormData({ ...formData, interviewAt: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                fetchApplication()
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {application.position}
          </h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Entreprise</h2>
              <p className="text-lg text-gray-900">{application.company.name}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Statut</h2>
              <p className="text-lg text-gray-900">{statusMap[application.status]}</p>
            </div>
            {application.deadline && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Deadline</h2>
                <p className="text-lg text-gray-900">
                  {new Date(application.deadline).toLocaleDateString("fr-FR")}
                </p>
              </div>
            )}
            {application.appliedAt && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Date d'envoi</h2>
                <p className="text-lg text-gray-900">
                  {new Date(application.appliedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            )}
            {application.interviewAt && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Date d'entretien</h2>
                <p className="text-lg text-gray-900">
                  {new Date(application.interviewAt).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
            {application.notes && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Notes</h2>
                <p className="text-lg text-gray-900 whitespace-pre-wrap">{application.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
