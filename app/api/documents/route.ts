import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      include: {
        application: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error)
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const applicationId = formData.get("applicationId") as string | null

    if (!file || !name || !type) {
      return NextResponse.json(
        { error: "Fichier, nom et type requis" },
        { status: 400 }
      )
    }

    // Upload vers Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    const document = await prisma.document.create({
      data: {
        name,
        type: type as any,
        url: blob.url,
        userId: session.user.id,
        applicationId: applicationId || null,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de l'upload du document:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
