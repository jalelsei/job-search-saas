import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        company: true,
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Erreur lors de la récupération des candidatures:", error)
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
    const {
      position,
      status,
      companyId,
      appliedAt,
      interviewAt,
      deadline,
      notes,
      headhunterProposals,
      announcementLink,
      productType,
      salary,
      benefits,
      publisherType,
      platform,
    } = body

    if (!position || !companyId) {
      return NextResponse.json(
        { error: "Poste et entreprise requis" },
        { status: 400 }
      )
    }

    const application = await prisma.application.create({
      data: {
        position,
        status: status || "TO_APPLY",
        companyId,
        userId: session.user.id,
        appliedAt: appliedAt ? new Date(appliedAt) : null,
        interviewAt: interviewAt ? new Date(interviewAt) : null,
        deadline: deadline ? new Date(deadline) : null,
        notes: notes || null,
        headhunterProposals: headhunterProposals || null,
        announcementLink: announcementLink || null,
        productType: productType || null,
        salary: salary || null,
        benefits: benefits || null,
        publisherType: publisherType || null,
        platform: platform || null,
      },
      include: {
        company: true,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la candidature:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
