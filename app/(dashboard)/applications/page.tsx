import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import ApplicationCard from "@/components/ApplicationCard"

const PAGE_SIZE = 18

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams?: { page?: string }
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1)
  const skip = (page - 1) * PAGE_SIZE

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        company: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.application.count({
      where: { userId: session.user.id },
    }),
  ])

  // Sérialiser pour éviter erreur Server Components en prod (Date non sérialisables)
  const serialized = JSON.parse(
    JSON.stringify(applications, (_, v) => (v instanceof Date ? v.toISOString() : v))
  )

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Candidatures</h1>
        <Link
          href="/applications/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Nouvelle candidature
        </Link>
      </div>

      {serialized.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucune candidature pour le moment.</p>
          <Link
            href="/applications/new"
            className="text-blue-600 hover:text-blue-500"
          >
            Créer votre première candidature
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {serialized.map((application: (typeof applications)[0]) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 text-sm">
              <Link
                href={page > 1 ? `/applications?page=${page - 1}` : "#"}
                aria-disabled={page <= 1}
                className={`px-3 py-1 rounded-md border ${
                  page <= 1
                    ? "text-gray-400 border-gray-200 cursor-default"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Précédent
              </Link>
              <span className="text-gray-500">
                Page {page} / {totalPages}
              </span>
              <Link
                href={page < totalPages ? `/applications?page=${page + 1}` : "#"}
                aria-disabled={page >= totalPages}
                className={`px-3 py-1 rounded-md border ${
                  page >= totalPages
                    ? "text-gray-400 border-gray-200 cursor-default"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Suivant
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
