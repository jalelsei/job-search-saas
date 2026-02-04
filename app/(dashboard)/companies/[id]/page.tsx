"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

function formatNombre(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value.replace(/\s/g, "")) : value
  if (Number.isNaN(n)) return String(value)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} M€`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")} k€`
  return `${n.toLocaleString("fr-FR")} €`
}

export default function CompanyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    size: "",
  })
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
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
      financesAnnuelles?: { annee: number; chiffreAffaires: number; resultat?: number }[]
      message?: string
      [key: string]: unknown
    }
  } | null>(null)
  const [paypersLoading, setPaypersLoading] = useState(false)

  useEffect(() => {
    fetchCompany()
  }, [params.id])

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/companies/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCompany(data)
        setFormData({
          name: data.name,
          website: data.website || "",
          industry: data.industry || "",
          size: data.size || "",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaypers = async () => {
    if (!params.id) return
    setPaypersLoading(true)
    setPaypersData(null)
    try {
      const response = await fetch(`/api/paypers?companyId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPaypersData(data)
      } else {
        const err = await response.json()
        alert(err.error || "Erreur API entreprise")
      }
    } catch (error) {
      alert("Erreur lors de l'appel API entreprise")
    } finally {
      setPaypersLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/companies/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchCompany()
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

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContact.name) {
      alert("Le nom du contact est requis")
      return
    }

    try {
      const response = await fetch(`/api/companies/${params.id}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      })

      if (response.ok) {
        setNewContact({ name: "", email: "", phone: "", position: "" })
        await fetchCompany()
      } else {
        const error = await response.json()
        alert(error.error || "Erreur lors de l'ajout du contact")
      }
    } catch (error) {
      alert("Une erreur est survenue")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
      return
    }

    try {
      const response = await fetch(`/api/companies/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/companies")
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      alert("Une erreur est survenue")
    }
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  if (!company) {
    return <div className="p-6">Entreprise non trouvée</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/companies"
          className="text-blue-600 hover:text-blue-500"
        >
          ← Retour
        </Link>
        {!editing && (
          <div className="space-x-2">
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
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Modifier l'entreprise</h1>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom *
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
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Secteur
            </label>
            <input
              type="text"
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              onClick={() => {
                setEditing(false)
                fetchCompany()
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
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{company.name}</h1>
          <div className="space-y-4">
            {company.website && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Site web</h2>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500"
                >
                  {company.website}
                </a>
              </div>
            )}
            {company.industry && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Secteur</h2>
                <p className="text-lg text-gray-900">{company.industry}</p>
              </div>
            )}
            {company.size && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Taille</h2>
                <p className="text-lg text-gray-900">{company.size}</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={fetchPaypers}
                disabled={paypersLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
              >
                {paypersLoading ? "Chargement..." : "Recherche API entreprise (Pappers)"}
              </button>
              {paypersData && (
                <div className="mt-4 space-y-4">
                  {/* Message si token manquant */}
                  {paypersData.paypers?.source === "none" && paypersData.paypers?.message && (
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800">
                      <p className="font-medium">{paypersData.paypers.message}</p>
                      <p className="mt-2 text-sm">Sur Netlify : ajoutez la variable <code className="bg-amber-100 px-1 rounded">PAPPERS_API_TOKEN</code> dans Site configuration → Environment variables, puis déclenchez un nouveau déploiement.</p>
                    </div>
                  )}

                  {/* Données de base (toujours affichées) */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2 text-sm">
                    <h3 className="font-semibold text-gray-900">Fiche entreprise</h3>
                    <p><span className="text-gray-500">Nom :</span> {paypersData.company.name}</p>
                    {paypersData.company.website && <p><span className="text-gray-500">Site :</span> <a href={paypersData.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{paypersData.company.website}</a></p>}
                    {paypersData.company.industry && <p><span className="text-gray-500">Secteur :</span> {paypersData.company.industry}</p>}
                    {paypersData.company.size && <p><span className="text-gray-500">Taille :</span> {paypersData.company.size}</p>}
                  </div>

                  {/* Bloc visuel : chiffres clés + identité + dirigeants quand Pappers OK */}
                  {paypersData.paypers?.source === "pappers" && (
                    <>
                      {/* Chiffres clés en cartes */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {paypersData.paypers.chiffreAffaires != null && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Chiffre d&apos;affaires</p>
                            <p className="text-xl font-bold text-emerald-900 mt-1">{formatNombre(paypersData.paypers.chiffreAffaires)}</p>
                          </div>
                        )}
                        {(paypersData.paypers.resultat != null && paypersData.paypers.resultat !== "") && (
                          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Résultat</p>
                            <p className="text-xl font-bold text-blue-900 mt-1">{formatNombre(paypersData.paypers.resultat)}</p>
                          </div>
                        )}
                        {(paypersData.paypers.effectif ?? paypersData.paypers.effectifMin ?? paypersData.paypers.effectifMax) != null && (
                          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                            <p className="text-xs font-medium text-violet-700 uppercase tracking-wide">Effectif</p>
                            <p className="text-xl font-bold text-violet-900 mt-1">
                              {paypersData.paypers.effectif ?? (paypersData.paypers.effectifMin != null && paypersData.paypers.effectifMax != null
                                ? `${paypersData.paypers.effectifMin} - ${paypersData.paypers.effectifMax}`
                                : paypersData.paypers.effectifMin ?? paypersData.paypers.effectifMax)}
                            </p>
                          </div>
                        )}
                        {paypersData.paypers.capital != null && paypersData.paypers.capital !== "" && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-medium text-slate-700 uppercase tracking-wide">Capital</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">{formatNombre(paypersData.paypers.capital)}</p>
                          </div>
                        )}
                      </div>

                      {/* Graphique CA sur les dernières années */}
                      {paypersData.paypers.financesAnnuelles && paypersData.paypers.financesAnnuelles.length > 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Chiffre d&apos;affaires (dernières années)</h3>
                          <div className="flex items-end gap-2 h-32">
                            {paypersData.paypers.financesAnnuelles.map((f: { annee: number; chiffreAffaires: number }) => {
                              const max = Math.max(...paypersData.paypers!.financesAnnuelles!.map((x: { chiffreAffaires: number }) => x.chiffreAffaires), 1)
                              const h = max ? (f.chiffreAffaires / max) * 100 : 0
                              return (
                                <div key={f.annee} className="flex-1 flex flex-col items-center gap-1">
                                  <div className="w-full bg-emerald-200 rounded-t flex items-end justify-center" style={{ height: `${Math.max(h, 4)}%`, minHeight: "4px" }}>
                                    <span className="text-xs font-medium text-emerald-800">{f.chiffreAffaires >= 1000 ? `${(f.chiffreAffaires / 1000).toFixed(0)}k` : f.chiffreAffaires}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">{f.annee}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Identité légale */}
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
                        <h3 className="font-semibold text-gray-900">Identité légale</h3>
                        {paypersData.paypers.siret && <p><span className="text-gray-500">SIRET :</span> {String(paypersData.paypers.siret)}</p>}
                        {paypersData.paypers.siren && <p><span className="text-gray-500">SIREN :</span> {String(paypersData.paypers.siren)}</p>}
                        {paypersData.paypers.formeJuridique && <p><span className="text-gray-500">Forme juridique :</span> {String(paypersData.paypers.formeJuridique)}</p>}
                        {paypersData.paypers.dateCreation && <p><span className="text-gray-500">Création :</span> {String(paypersData.paypers.dateCreation)}</p>}
                        {paypersData.paypers.address && <p><span className="text-gray-500">Adresse :</span> {String(paypersData.paypers.address)}</p>}
                      </div>

                      {/* Dirigeants */}
                      {(paypersData.paypers.manager ?? (paypersData.paypers.managers && paypersData.paypers.managers.length > 0)) && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">Dirigeant(s)</h3>
                          {paypersData.paypers.manager ? (
                            <p className="text-gray-900">{paypersData.paypers.manager}</p>
                          ) : (
                            <ul className="list-disc list-inside text-gray-900 space-y-1">
                              {paypersData.paypers.managers!.map((m: { nom?: string; fonction?: string }, i: number) => (
                                <li key={i}>{m.nom ?? ""} {m.fonction ? `— ${m.fonction}` : ""}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {paypersData.contacts?.length > 0 && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-gray-500 mb-1 font-medium">Vos contacts</p>
                          <ul className="list-disc list-inside text-gray-900 text-sm">
                            {paypersData.contacts.map((c: { name: string; position?: string; email?: string }, i: number) => (
                              <li key={i}>{c.name} {c.position ? `(${c.position})` : ""} {c.email ? `— ${c.email}` : ""}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contacts */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contacts</h2>
        <form onSubmit={handleAddContact} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-700">Ajouter un contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nom *"
              required
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Poste"
              value={newContact.position}
              onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ajouter
          </button>
        </form>
        {company.contacts && company.contacts.length > 0 ? (
          <div className="space-y-2">
            {company.contacts.map((contact: any) => (
              <div key={contact.id} className="p-3 border rounded-lg">
                <p className="font-medium">{contact.name}</p>
                {contact.position && <p className="text-sm text-gray-600">{contact.position}</p>}
                {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucun contact</p>
        )}
      </div>

      {/* Candidatures */}
      {company.applications && company.applications.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Candidatures</h2>
          <div className="space-y-2">
            {company.applications.map((app: any) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="block p-3 border rounded-lg hover:bg-gray-50"
              >
                <p className="font-medium">{app.position}</p>
                <p className="text-sm text-gray-600">
                  {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
