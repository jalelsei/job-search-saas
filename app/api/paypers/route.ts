import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/paypers?companyId=xxx
 * Récupère les infos entreprise (pour intégration PayPers: compte, adresse, dirigeant).
 * Sans PAYPERS_API_KEY, retourne les données de notre base (company + contacts).
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

    // Si vous avez une clé API PayPers, appeler leur API ici (ex: SIRET) et fusionner les données
    const paypersApiKey = process.env.PAYPERS_API_KEY
    let paypersData: {
      siret?: string
      address?: string
      manager?: string
      [key: string]: unknown
    } | null = null

    if (paypersApiKey) {
      // TODO: appeler l'API PayPers avec le SIRET ou le nom de l'entreprise
      // Ex: const res = await fetch(`https://api.paypers.fr/...?siret=${siret}`, { headers: { Authorization: paypersApiKey } })
      // paypersData = await res.json()
      paypersData = {
        siret: null,
        address: null,
        manager: null,
        _message: "Configurez l'appel API PayPers dans api/paypers/route.ts",
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
      paypers: paypersData,
    })
  } catch (error) {
    console.error("Erreur PayPers:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
