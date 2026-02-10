"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NewApplicationPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    position: "",
    status: "TO_APPLY",
    companyId: "",
    appliedAt: "",
    interviewAt: "",
    deadline: "",
    notes: "",
    headhunterProposals: "",
    cabinetCompanyId: "",
    cabinetContactId: "",
    announcementLink: "",
    productType: "",
    salary: "",
    benefits: "",
    publisherType: "" as "" | "CABINET" | "ENTREPRISE",
    platform: "",
  })
  const [cabinetContacts, setCabinetContacts] = useState<{ id: string; name: string; email: string | null; phone: string | null; position: string | null }[]>([])

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (!formData.cabinetCompanyId) {
      setCabinetContacts([])
      return
    }
    let cancelled = false
    fetch(`/api/companies/${formData.cabinetCompanyId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((company) => {
        if (!cancelled && company?.contacts) setCabinetContacts(company.contacts)
        else if (!cancelled) setCabinetContacts([])
      })
      .catch(() => { if (!cancelled) setCabinetContacts([]) })
    return () => { cancelled = true }
  }, [formData.cabinetCompanyId])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        ...formData,
        headhunterProposals: formData.headhunterProposals || undefined,
        cabinetCompanyId: formData.cabinetCompanyId || undefined,
        cabinetContactId: formData.cabinetContactId || undefined,
        announcementLink: formData.announcementLink || undefined,
        productType: formData.productType || undefined,
        salary: formData.salary || undefined,
        benefits: formData.benefits || undefined,
        publisherType: formData.publisherType || undefined,
        platform: formData.platform || undefined,
      }
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push("/applications")
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

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Nouvelle candidature
      </h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
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
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sélectionner une entreprise</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <a
            href="/companies/new"
            className="text-sm text-blue-600 hover:text-blue-500 mt-1 inline-block"
          >
            Créer une nouvelle entreprise
          </a>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Statut
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="announcementLink" className="block text-sm font-medium text-gray-700">
            Lien de l'annonce
          </label>
          <input
            type="url"
            id="announcementLink"
            placeholder="https://..."
            value={formData.announcementLink}
            onChange={(e) => setFormData({ ...formData, announcementLink: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
            Plateforme (LinkedIn, Indeed, etc.)
          </label>
          <input
            type="text"
            id="platform"
            placeholder="LinkedIn, Indeed, Welcome to the Jungle..."
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isHeadhunter"
            type="checkbox"
            checked={formData.publisherType === "CABINET"}
            onChange={(e) =>
              setFormData({
                ...formData,
                publisherType: (e.target.checked ? "CABINET" : "") as "" | "CABINET" | "ENTREPRISE",
              })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isHeadhunter" className="text-sm font-medium text-gray-700">
            Offre proposée par un chasseur de tête
          </label>
        </div>

        <div>
          <label htmlFor="productType" className="block text-sm font-medium text-gray-700">
            Type de produit / secteur (ce que l'entreprise vend)
          </label>
          <input
            type="text"
            id="productType"
            placeholder="SaaS, assurance, retail..."
            value={formData.productType}
            onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
            Salaire
          </label>
          <input
            type="text"
            id="salary"
            placeholder="40k-50k, Non communiqué..."
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="benefits" className="block text-sm font-medium text-gray-700">
            Avantages
          </label>
          <textarea
            id="benefits"
            rows={2}
            placeholder="Télétravail, mutuelle, CE..."
            value={formData.benefits}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
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
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="headhunterProposals" className="block text-sm font-medium text-gray-700">
            Propositions cabinet (offres de chasse)
          </label>
          <textarea
            id="headhunterProposals"
            rows={3}
            placeholder="Offres proposées par les cabinets / chasseurs de tête"
            value={formData.headhunterProposals}
            onChange={(e) => setFormData({ ...formData, headhunterProposals: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="cabinetCompanyId" className="block text-sm font-medium text-gray-700">
            Cabinet recruteur (chasseur de tête)
          </label>
          <select
            id="cabinetCompanyId"
            value={formData.cabinetCompanyId}
            onChange={(e) => setFormData({ ...formData, cabinetCompanyId: e.target.value, cabinetContactId: "" })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">— Aucun —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cabinetContactId" className="block text-sm font-medium text-gray-700">
            Contact au cabinet
          </label>
          <select
            id="cabinetContactId"
            value={formData.cabinetContactId}
            onChange={(e) => setFormData({ ...formData, cabinetContactId: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">— Aucun —</option>
            {cabinetContacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.position ? ` (${c.position})` : ""}</option>
            ))}
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
