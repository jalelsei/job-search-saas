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
    paypers?: {
      source?: string
      siret?: string; siren?: string; address?: string; manager?: string
      managers?: { nom?: string; fonction?: string }[]
      effectif?: string; effectifMin?: number; effectifMax?: number
      chiffreAffaires?: string; resultat?: string
      formeJuridique?: string; dateCreation?: string; capital?: string
      message?: string
      [key: string]: unknown
    }
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
    <div className="min-h-screen sm:min-h-0 px-3 py-4 sm:px-0 sm:py-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
        <Link
          href="/applications"
          className="text-blue-600 hover:text-blue-500 text-sm sm:text-base touch-manipulation"
        >
          ← Retour
        </Link>
        <div className="flex flex-wrap gap-2">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="min-h-[44px] px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium touch-manipulation"
              >
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="min-h-[44px] px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium touch-manipulation"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Modifier la candidature</h1>

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

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                fetchApplication()
              }}
              className="min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 touch-manipulation"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 touch-manipulation"
            >
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white shadow rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Poste + Entreprise / Cabinet bien visibles */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {application.position}
            </h1>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Entreprise / Cabinet</span>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">
                {application.company.name}
              </p>
            </div>
          </div>

          {/* Compteur temps écoulé — bien visible */}
          {timeSince && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-4 py-3 sm:py-3.5">
              <span className="text-sm sm:text-base font-semibold text-gray-700">Temps écoulé :</span>
              <span className="text-base sm:text-lg font-bold text-gray-900">{timeSince}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Statut</h2>
              <p className="text-lg text-gray-900">{statusMap[application.status]}</p>
            </div>
            {application.platform && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Plateforme</h2>
                <p className="text-lg text-gray-900">{application.platform}</p>
              </div>
            )}
          </div>

          {/* Lien annonce — grand et facile à cliquer (mobile + desktop) */}
          {application.announcementLink && (
            <div className="w-full">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Lien de l'annonce</h2>
              <a
                href={application.announcementLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full min-h-[48px] sm:min-h-[52px] px-4 py-3 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 text-base sm:text-lg font-medium break-all text-center touch-manipulation active:scale-[0.98] transition"
              >
                <span className="flex-1 min-w-0 truncate sm:break-all">Ouvrir l'annonce</span>
                <span className="shrink-0" aria-hidden>→</span>
              </a>
              <p className="mt-1.5 text-xs text-gray-400 truncate max-w-full" title={application.announcementLink}>
                {application.announcementLink}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="mt-4">
            <button
              type="button"
              onClick={fetchPaypers}
              disabled={paypersLoading}
              className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px] px-5 py-3 sm:py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-base sm:text-sm font-medium touch-manipulation"
            >
              {paypersLoading ? "Chargement..." : "Recherche API entreprise"}
            </button>
            {paypersData && (
              <div className="mt-4 p-4 sm:p-5 rounded-xl border border-gray-200 bg-gray-50 space-y-3 text-sm sm:text-base">
                <h3 className="font-semibold text-gray-900">Données entreprise</h3>
                <p><span className="text-gray-500">Nom :</span> {paypersData.company.name}</p>
                {paypersData.company.website && <p><span className="text-gray-500">Site :</span> {paypersData.company.website}</p>}
                {paypersData.company.industry && <p><span className="text-gray-500">Secteur :</span> {paypersData.company.industry}</p>}
                {paypersData.company.size && <p><span className="text-gray-500">Taille :</span> {paypersData.company.size}</p>}
                {paypersData.paypers?.source === "pappers" && (
                  <>
                    {paypersData.paypers?.address && <p><span className="text-gray-500">Adresse :</span> {String(paypersData.paypers.address)}</p>}
                    {paypersData.paypers?.siret && <p><span className="text-gray-500">SIRET :</span> {String(paypersData.paypers.siret)}</p>}
                    {paypersData.paypers?.siren && <p><span className="text-gray-500">SIREN :</span> {String(paypersData.paypers.siren)}</p>}
                    {paypersData.paypers?.formeJuridique && <p><span className="text-gray-500">Forme juridique :</span> {String(paypersData.paypers.formeJuridique)}</p>}
                    {(paypersData.paypers?.effectif ?? paypersData.paypers?.effectifMin ?? paypersData.paypers?.effectifMax) != null && (
                      <p><span className="text-gray-500">Effectif :</span>{" "}
                        {paypersData.paypers.effectif ?? (paypersData.paypers.effectifMin != null && paypersData.paypers.effectifMax != null
                          ? `${paypersData.paypers.effectifMin} - ${paypersData.paypers.effectifMax}`
                          : paypersData.paypers.effectifMin ?? paypersData.paypers.effectifMax)}
                      </p>
                    )}
                    {paypersData.paypers?.chiffreAffaires && <p><span className="text-gray-500">Chiffre d'affaires :</span> {String(paypersData.paypers.chiffreAffaires)}</p>}
                    {paypersData.paypers?.resultat != null && <p><span className="text-gray-500">Résultat :</span> {String(paypersData.paypers.resultat)}</p>}
                    {paypersData.paypers?.dateCreation && <p><span className="text-gray-500">Création :</span> {String(paypersData.paypers.dateCreation)}</p>}
                    {paypersData.paypers?.capital != null && <p><span className="text-gray-500">Capital :</span> {String(paypersData.paypers.capital)}</p>}
                    {(paypersData.paypers?.manager ?? (paypersData.paypers?.managers && paypersData.paypers.managers.length > 0)) && (
                      <div>
                        <p className="text-gray-500 mb-1">Dirigeant(s)</p>
                        {paypersData.paypers.manager ? (
                          <p className="text-gray-900">{paypersData.paypers.manager}</p>
                        ) : (
                          <ul className="list-disc list-inside text-gray-900">
                            {paypersData.paypers.managers!.map((m, i) => (
                              <li key={i}>{m.nom ?? ""} {m.fonction ? `— ${m.fonction}` : ""}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </>
                )}
                {paypersData.paypers?.source === "none" && paypersData.paypers?.message && (
                  <p className="text-amber-700">{paypersData.paypers.message}</p>
                )}
                {paypersData.contacts?.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Vos contacts</p>
                    <ul className="list-disc list-inside text-gray-900">
                      {paypersData.contacts.map((c, i) => (
                        <li key={i}>{c.name} {c.position ? `(${c.position})` : ""} {c.email ? `— ${c.email}` : ""}</li>
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
