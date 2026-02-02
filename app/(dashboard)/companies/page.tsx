import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import CompanyCard from "@/components/CompanyCard"

export default async function CompaniesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const companies = await prisma.company.findMany({
    where: { userId: session.user.id },
    include: {
      applications: true,
      contacts: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Entreprises</h1>
        <Link
          href="/companies/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Nouvelle entreprise
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucune entreprise pour le moment.</p>
          <Link
            href="/companies/new"
            className="text-blue-600 hover:text-blue-500"
          >
            Créer votre première entreprise
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  )
}
