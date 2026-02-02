import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const company = await prisma.company.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        contacts: true,
        applications: {
          include: {
            documents: true,
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entreprise:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { name, website, industry, size } = body

    // Vérifier que l'entreprise appartient à l'utilisateur
    const existing = await prisma.company.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      )
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name: name || undefined,
        website: website !== undefined ? website : undefined,
        industry: industry !== undefined ? industry : undefined,
        size: size !== undefined ? size : undefined,
      },
      include: {
        contacts: true,
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    // Vérifier que l'entreprise appartient à l'utilisateur
    const existing = await prisma.company.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      )
    }

    await prisma.company.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Entreprise supprimée" })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
