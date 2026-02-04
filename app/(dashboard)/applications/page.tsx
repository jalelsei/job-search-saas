import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import ApplicationCard from "@/components/ApplicationCard"

export default async function ApplicationsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: {
      company: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Sérialiser pour éviter erreur Server Components en prod (Date non sérialisables)
  const serialized = JSON.parse(
    JSON.stringify(applications, (_, v) => (v instanceof Date ? v.toISOString() : v))
  )

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {serialized.map((application: (typeof applications)[0]) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  )
}
