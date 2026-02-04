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
    announcementLink: "",
    productType: "",
    salary: "",
    benefits: "",
    publisherType: "" as "" | "CABINET" | "ENTREPRISE",
    platform: "",
  })
  const [paypersData, setPaypersData] = useState<{
    company: { name: string; website?: string; industry?: string; size?: string }
    contacts: { name: string; email?: string; phone?: string; position?: string }[]
    paypers?: { siret?: string; address?: string; manager?: string; [key: string]: unknown }
  } | null>(null)
  const [paypersLoading, setPaypersLoading] = useState(false)

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
          announcementLink: data.announcementLink || "",
          productType: data.productType || "",
          salary: data.salary || "",
          benefits: data.benefits || "",
          publisherType: (data.publisherType as "" | "CABINET" | "ENTREPRISE") || "",
          platform: data.platform || "",
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

  const fetchPaypers = async () => {
    if (!application?.companyId) return
    setPaypersLoading(true)
    try {
      const response = await fetch(`/api/paypers?companyId=${application.companyId}`)
      if (response.ok) {
        const data = await response.json()
        setPaypersData(data)
      } else {
        const err = await response.json()
        alert(err.error || "Erreur PayPers")
      }
    } catch (error) {
      alert("Erreur lors de l'appel PayPers")
    } finally {
      setPaypersLoading(false)
    }
  }

  const referenceDate = application?.appliedAt ? new Date(application.appliedAt) : application ? new Date(application.createdAt) : null
  const timeSince = referenceDate
    ? (() => {
        const now = new Date()
        const diffMs = now.getTime() - referenceDate.getTime()
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        if (days === 0) return "Aujourd'hui"
        if (days === 1) return "Il y a 1 jour"
        if (days < 7) return `Il y a ${days} jours`
        const weeks = Math.floor(days / 7)
        if (weeks === 1) return "Il y a 1 semaine"
        if (weeks < 4) return `Il y a ${weeks} semaines`
        const months = Math.floor(days / 30)
        if (months === 1) return "Il y a 1 mois"
        return `Il y a ${months} mois`
      })()
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        ...formData,
        announcementLink: formData.announcementLink || undefined,
        productType: formData.productType || undefined,
        salary: formData.salary || undefined,
        benefits: formData.benefits || undefined,
        publisherType: formData.publisherType || undefined,
        platform: formData.platform || undefined,
      }
      const response = await fetch(`/api/applications/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
            <label htmlFor="announcementLink" className="block text-sm font-medium text-gray-700">
              Lien de l'annonce
            </label>
            <input
              type="url"
              id="announcementLink"
              value={formData.announcementLink}
              onChange={(e) => setFormData({ ...formData, announcementLink: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
              Plateforme
            </label>
            <input
              type="text"
              id="platform"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="publisherType" className="block text-sm font-medium text-gray-700">
              Type de société (cabinet / entreprise)
            </label>
            <select
              id="publisherType"
              value={formData.publisherType}
              onChange={(e) => setFormData({ ...formData, publisherType: e.target.value as "" | "CABINET" | "ENTREPRISE" })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
            >
              <option value="">— Choisir —</option>
              <option value="CABINET">Cabinet</option>
              <option value="ENTREPRISE">Entreprise</option>
            </select>
          </div>
          <div>
            <label htmlFor="productType" className="block text-sm font-medium text-gray-700">
              Type de produit / secteur
            </label>
            <input
              type="text"
              id="productType"
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
              Salaire
            </label>
            <input
              type="text"
              id="salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="benefits" className="block text-sm font-medium text-gray-700">
              Avantages
            </label>
            <textarea
              id="benefits"
              rows={2}
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
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
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {application.position}
          </h1>

          {timeSince && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm text-gray-700">
              <span className="font-medium">Écoulé depuis la candidature :</span>
              <span>{timeSince}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Entreprise</h2>
              <p className="text-lg text-gray-900">{application.company.name}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Statut</h2>
              <p className="text-lg text-gray-900">{statusMap[application.status]}</p>
            </div>
            {(application.platform ?? application.announcementLink) && (
              <>
                {application.platform && (
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Plateforme</h2>
                    <p className="text-lg text-gray-900">{application.platform}</p>
                  </div>
                )}
                {application.announcementLink && (
                  <div className="sm:col-span-2">
                    <h2 className="text-sm font-medium text-gray-500">Lien de l'annonce</h2>
                    <a
                      href={application.announcementLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {application.announcementLink}
                    </a>
                  </div>
                )}
              </>
            )}
            {application.publisherType && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Type de société</h2>
                <p className="text-lg text-gray-900">
                  {application.publisherType === "CABINET" ? "Cabinet (recrutement)" : "Entreprise"}
                </p>
              </div>
            )}
            {application.productType && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Type de produit / secteur</h2>
                <p className="text-lg text-gray-900">{application.productType}</p>
              </div>
            )}
            {application.salary && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Salaire</h2>
                <p className="text-lg text-gray-900">{application.salary}</p>
              </div>
            )}
            {application.benefits && (
              <div className="sm:col-span-2">
                <h2 className="text-sm font-medium text-gray-500">Avantages</h2>
                <p className="text-lg text-gray-900 whitespace-pre-wrap">{application.benefits}</p>
              </div>
            )}
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
          </div>

          <div>
            <button
              type="button"
              onClick={fetchPaypers}
              disabled={paypersLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {paypersLoading ? "Chargement..." : "Infos entreprise (API PayPers)"}
            </button>
            {paypersData && (
              <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-3">
                <h3 className="font-medium text-gray-900">Données entreprise / PayPers</h3>
                <p><span className="text-gray-500">Nom :</span> {paypersData.company.name}</p>
                {paypersData.company.website && <p><span className="text-gray-500">Site :</span> {paypersData.company.website}</p>}
                {paypersData.company.industry && <p><span className="text-gray-500">Secteur :</span> {paypersData.company.industry}</p>}
                {paypersData.company.size && <p><span className="text-gray-500">Taille :</span> {paypersData.company.size}</p>}
                {paypersData.paypers?.address != null && <p><span className="text-gray-500">Adresse :</span> {String(paypersData.paypers.address)}</p>}
                {paypersData.paypers?.manager != null && <p><span className="text-gray-500">Dirigeant :</span> {String(paypersData.paypers.manager)}</p>}
                {paypersData.paypers?.siret != null && <p><span className="text-gray-500">SIRET :</span> {String(paypersData.paypers.siret)}</p>}
                {paypersData.contacts?.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Contacts</p>
                    <ul className="list-disc list-inside text-gray-900">
                      {paypersData.contacts.map((c, i) => (
                        <li key={i}>{c.name} {c.position && `(${c.position})`} {c.email && `— ${c.email}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {application.notes && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">Notes</h2>
              <p className="text-lg text-gray-900 whitespace-pre-wrap">{application.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
