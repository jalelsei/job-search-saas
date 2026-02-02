import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { del } from "@vercel/blob"

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
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      )
    }

    // Supprimer le fichier de Vercel Blob
    try {
      await del(document.url)
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier:", error)
    }

    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Document supprimé" })
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
