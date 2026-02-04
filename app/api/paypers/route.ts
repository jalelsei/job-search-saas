import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/** Données enrichies (Pappers ou autre source) */
type EnrichedData = {
  source: "pappers"
  siret?: string
  siren?: string
  address?: string
  manager?: string
  managers?: { nom?: string; fonction?: string }[]
  effectif?: string
  effectifMin?: number
  effectifMax?: number
  chiffreAffaires?: string
  resultat?: string
  formeJuridique?: string
  dateCreation?: string
  capital?: string
  [key: string]: unknown
} | {
  source: "none"
  message: string
}

/**
 * GET /api/paypers?companyId=xxx
 * Récupère les infos entreprise. Avec PAPPERS_API_TOKEN, appelle l'API Pappers
 * (100 requêtes gratuites sur https://www.pappers.fr/api/register) pour données
 * légales : adresse, dirigeants, effectifs, finances, etc.
 */
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId requis" },
        { status: 400 }
      )
    }

    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        userId: session.user.id,
      },
      include: {
        contacts: true,
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      )
    }

    let apiData: EnrichedData = {
      source: "none",
      message: "Ajoutez PAPPERS_API_TOKEN (gratuit sur pappers.fr/api/register) pour les données enrichies.",
    }

    const token = process.env.PAPPERS_API_TOKEN
    if (token && company.name?.trim()) {
      try {
        const searchRes = await fetch(
          `https://api.pappers.fr/v2/recherche?api_token=${encodeURIComponent(token)}&q=${encodeURIComponent(company.name.trim())}&par_page=1&page=1`,
          { next: { revalidate: 0 } }
        )
        if (!searchRes.ok) {
          apiData = { source: "none", message: "Recherche Pappers indisponible." }
        } else {
          const searchJson = await searchRes.json() as { resultats?: { siren?: string }[] }
          const siren = searchJson?.resultats?.[0]?.siren
          if (siren) {
            const entRes = await fetch(
              `https://api.pappers.fr/v2/entreprise?api_token=${encodeURIComponent(token)}&siren=${siren}`,
              { next: { revalidate: 0 } }
            )
            if (entRes.ok) {
              const ent = await entRes.json() as Record<string, unknown>
              const siege = ent.siege as Record<string, unknown> | undefined
              const adresse = siege
                ? [siege.adresse_ligne_1, siege.code_postal, siege.ville].filter(Boolean).join(", ")
                : undefined
              const dirigeants = ent.dirigeants as { nom?: string; prenoms?: string; fonction?: string }[] | undefined
              const premierDirigeant = dirigeants?.[0]
              const manager = premierDirigeant
                ? [premierDirigeant.prenoms, premierDirigeant.nom].filter(Boolean).join(" ") + (premierDirigeant.fonction ? ` (${premierDirigeant.fonction})` : "")
                : undefined
              const effectif = (ent.effectif as number | undefined) != null
                ? String(ent.effectif)
                : undefined
              const finances = ent.finances as Record<string, unknown>[] | undefined
              const derniersComptes = finances?.[0] as Record<string, unknown> | undefined
              const ca = derniersComptes?.chiffre_affaires ?? derniersComptes?.chiffre_d_affaires
              const resultat = derniersComptes?.resultat
              apiData = {
                source: "pappers",
                siren: ent.siren as string | undefined,
                siret: (siege?.siret ?? ent.siret) as string | undefined,
                address: adresse ?? (ent.adresse as string | undefined),
                manager,
                managers: dirigeants?.map((d) => ({
                  nom: [d.prenoms, d.nom].filter(Boolean).join(" "),
                  fonction: d.fonction,
                })),
                effectif,
                effectifMin: ent.effectif_min as number | undefined,
                effectifMax: ent.effectif_max as number | undefined,
                chiffreAffaires: ca != null ? String(ca) : undefined,
                resultat: resultat != null ? String(resultat) : undefined,
                formeJuridique: ent.forme_juridique as string | undefined,
                dateCreation: ent.date_creation as string | undefined,
                capital: ent.capital != null ? String(ent.capital) : undefined,
              }
            }
          }
        }
      } catch (err) {
        console.error("Erreur API Pappers:", err)
        apiData = { source: "none", message: "Erreur lors de l'appel API entreprise." }
      }
    }

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        website: company.website,
        industry: company.industry,
        size: company.size,
      },
      contacts: company.contacts,
      paypers: apiData,
    })
  } catch (error) {
    console.error("Erreur paypers:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
