import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id

  // Récupérer les statistiques
  const [
    totalApplications,
    applicationsByStatus,
    recentApplications,
    totalCompanies,
  ] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.application.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.application.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { company: true },
    }),
    prisma.company.count({ where: { userId } }),
  ])

  const statusMap: Record<string, string> = {
    TO_APPLY: "À postuler",
    APPLIED: "Candidature envoyée",
    INTERVIEW: "Entretien",
    REJECTED: "Refus",
    ACCEPTED: "Accepté",
  }

  const statusCounts = applicationsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {session.user.name || session.user.email}
        </h1>
        <p className="mt-2 text-gray-600">
          Voici un aperçu de votre recherche d'emploi
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-gray-900">
                  {totalApplications}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-500">
                Candidatures totales
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-blue-600">
                  {statusCounts["TO_APPLY"] || 0}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-500">À postuler</p>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-green-600">
                  {statusCounts["INTERVIEW"] || 0}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-500">Entretiens</p>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-gray-900">
                  {totalCompanies}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-500">Entreprises</p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidatures récentes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Candidatures récentes
            </h2>
            <Link
              href="/applications"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Voir tout
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune candidature pour le moment.{" "}
              <Link
                href="/applications/new"
                className="text-blue-600 hover:text-blue-500"
              >
                Créer votre première candidature
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {app.position}
                    </h3>
                    <p className="text-sm text-gray-500">{app.company.name}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {statusMap[app.status]}
                    </span>
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
