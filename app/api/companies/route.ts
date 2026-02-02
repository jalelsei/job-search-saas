import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const companies = await prisma.company.findMany({
      where: { userId: session.user.id },
      include: {
        contacts: true,
        applications: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { name, website, industry, size, contacts } = body

    if (!name) {
      return NextResponse.json(
        { error: "Nom de l'entreprise requis" },
        { status: 400 }
      )
    }

    const company = await prisma.company.create({
      data: {
        name,
        website: website || null,
        industry: industry || null,
        size: size || null,
        userId: session.user.id,
        contacts: contacts ? {
          create: contacts.map((contact: any) => ({
            name: contact.name,
            email: contact.email || null,
            phone: contact.phone || null,
            position: contact.position || null,
          }))
        } : undefined,
      },
      include: {
        contacts: true,
      },
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de l'entreprise:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
