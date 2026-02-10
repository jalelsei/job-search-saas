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
    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        company: {
          include: {
            contacts: true,
          },
        },
        cabinetCompany: true,
        cabinetContact: true,
        documents: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Candidature non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Erreur lors de la récupération de la candidature:", error)
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
    const {
      position,
      status,
      companyId,
      appliedAt,
      interviewAt,
      deadline,
      notes,
      headhunterProposals,
      cabinetCompanyId,
      cabinetContactId,
      announcementLink,
      productType,
      salary,
      benefits,
      publisherType,
      platform,
    } = body

    // Vérifier que la candidature appartient à l'utilisateur
    const existing = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Candidature non trouvée" },
        { status: 404 }
      )
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        position: position ?? undefined,
        status: status ?? undefined,
        companyId: companyId ?? undefined,
        appliedAt: appliedAt ? new Date(appliedAt) : appliedAt === null ? null : undefined,
        interviewAt: interviewAt ? new Date(interviewAt) : interviewAt === null ? null : undefined,
        deadline: deadline ? new Date(deadline) : deadline === null ? null : undefined,
        notes: notes !== undefined ? notes : undefined,
        headhunterProposals: headhunterProposals !== undefined ? headhunterProposals : undefined,
        cabinetCompanyId: cabinetCompanyId !== undefined ? cabinetCompanyId || null : undefined,
        cabinetContactId: cabinetContactId !== undefined ? cabinetContactId || null : undefined,
        announcementLink: announcementLink !== undefined ? announcementLink : undefined,
        productType: productType !== undefined ? productType : undefined,
        salary: salary !== undefined ? salary : undefined,
        benefits: benefits !== undefined ? benefits : undefined,
        publisherType: publisherType !== undefined ? (publisherType || null) : undefined,
        platform: platform !== undefined ? platform : undefined,
      },
      include: {
        company: true,
        cabinetCompany: true,
        cabinetContact: true,
        documents: true,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la candidature:", error)
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
    // Vérifier que la candidature appartient à l'utilisateur
    const existing = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Candidature non trouvée" },
        { status: 404 }
      )
    }

    await prisma.application.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Candidature supprimée" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la candidature:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
