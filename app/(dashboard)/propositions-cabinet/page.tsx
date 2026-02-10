"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type Application = {
  id: string
  position: string
  headhunterProposals: string | null
  company: { id: string; name: string }
  cabinetCompany: { id: string; name: string } | null
  cabinetContact: { id: string; name: string; email: string | null; phone: string | null; position: string | null } | null
}

export default function PropositionsCabinetPage() {
  const [offers, setOffers] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"cabinet" | "entreprise">("cabinet")

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch("/api/applications")
        if (!res.ok) return
        const data: Application[] = await res.json()
        const filtered = data.filter(
          (app: Application) => (app.headhunterProposals?.trim?.()?.length ? true : !!app.cabinetCompany)
        )
        setOffers(filtered)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  const byCabinet = offers.reduce((acc, app) => {
    const key = app.cabinetCompany?.name ?? "Sans cabinet"
    if (!acc[key]) acc[key] = []
    acc[key].push(app)
    return acc
  }, {} as Record<string, Application[]>)

  const byEntreprise = offers.reduce((acc, app) => {
    const key = app.company?.name ?? "—"
    if (!acc[key]) acc[key] = []
    acc[key].push(app)
    return acc
  }, {} as Record<string, Application[]>)

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <p className="text-gray-500">Chargement des propositions cabinet…</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Propositions cabinet</h1>
        <p className="mt-1 text-gray-600">
          Offres proposées par les cabinets / chasseurs de tête, avec contact et entreprise qui embauche
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500 mb-2">Aucune proposition cabinet pour le moment.</p>
          <p className="text-sm text-gray-500 mb-4">
            Renseignez un cabinet recruteur et/ou le champ « Propositions cabinet » sur une candidature.
          </p>
          <Link href="/applications" className="text-blue-600 hover:text-blue-500 font-medium">
            Voir les candidatures →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setTab("cabinet")}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                tab === "cabinet"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Par cabinet recruteur
            </button>
            <button
              type="button"
              onClick={() => setTab("entreprise")}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                tab === "entreprise"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Par entreprise qui embauche
            </button>
          </div>

          {tab === "cabinet" ? (
            <div className="space-y-8">
              {Object.entries(byCabinet).map(([cabinetName, apps]) => (
                <div key={cabinetName} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {cabinetName}
                    </h2>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {apps.map((app) => (
                      <li key={app.id} className="p-4 hover:bg-gray-50/50">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">{app.position}</p>
                            <p className="text-sm text-gray-600 mt-0.5">
                              Entreprise qui embauche :{" "}
                              <Link href={`/companies/${app.company.id}`} className="text-blue-600 hover:underline">
                                {app.company.name}
                              </Link>
                            </p>
                            {app.cabinetContact && (
                              <p className="text-sm text-gray-500 mt-1">
                                Contact : {app.cabinetContact.name}
                                {app.cabinetContact.position && ` (${app.cabinetContact.position})`}
                                {app.cabinetContact.email && (
                                  <a href={`mailto:${app.cabinetContact.email}`} className="text-blue-600 hover:underline ml-1">
                                    {app.cabinetContact.email}
                                  </a>
                                )}
                                {app.cabinetContact.phone && (
                                  <a href={`tel:${app.cabinetContact.phone}`} className="text-blue-600 hover:underline ml-1">
                                    {app.cabinetContact.phone}
                                  </a>
                                )}
                              </p>
                            )}
                            {app.headhunterProposals && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {app.headhunterProposals}
                              </p>
                            )}
                          </div>
                          <Link
                            href={`/applications/${app.id}`}
                            className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                            Voir la candidature
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(byEntreprise).map(([companyName, apps]) => (
                <div key={companyName} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {companyName}
                    </h2>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {apps.map((app) => (
                      <li key={app.id} className="p-4 hover:bg-gray-50/50">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">{app.position}</p>
                            {app.cabinetCompany && (
                              <p className="text-sm text-gray-600 mt-0.5">
                                Cabinet :{" "}
                                <Link href={`/companies/${app.cabinetCompany.id}`} className="text-blue-600 hover:underline">
                                  {app.cabinetCompany.name}
                                </Link>
                              </p>
                            )}
                            {app.cabinetContact && (
                              <p className="text-sm text-gray-500 mt-1">
                                Contact : {app.cabinetContact.name}
                                {app.cabinetContact.email && (
                                  <a href={`mailto:${app.cabinetContact.email}`} className="text-blue-600 hover:underline ml-1">
                                    {app.cabinetContact.email}
                                  </a>
                                )}
                              </p>
                            )}
                            {app.headhunterProposals && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {app.headhunterProposals}
                              </p>
                            )}
                          </div>
                          <Link
                            href={`/applications/${app.id}`}
                            className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                            Voir la candidature
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
