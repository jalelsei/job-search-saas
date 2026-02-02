import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, phone, position } = body

    if (!name) {
      return NextResponse.json(
        { error: "Nom du contact requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'entreprise appartient à l'utilisateur
    const company = await prisma.company.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      )
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        position: position || null,
        companyId: id,
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du contact:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
