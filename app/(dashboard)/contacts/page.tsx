import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ContactsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const contacts = await prisma.contact.findMany({
    where: { company: { userId: session.user.id } },
    include: { company: true },
    orderBy: [{ company: { name: "asc" } }, { name: "asc" }],
  })

  const serialized = JSON.parse(
    JSON.stringify(contacts, (_, v) => (v instanceof Date ? v.toISOString() : v))
  )

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <p className="mt-1 text-gray-600">
          Tous vos contacts avec leur entreprise et leur poste
        </p>
      </div>

      {serialized.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Aucun contact pour le moment.</p>
          <p className="text-sm text-gray-500 mb-4">
            Ajoutez des contacts depuis une fiche entreprise.
          </p>
          <Link
            href="/companies"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Voir les entreprises →
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nom
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Poste
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Entreprise
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Téléphone
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fiche
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serialized.map(
                  (contact: {
                    id: string
                    name: string
                    position: string | null
                    email: string | null
                    phone: string | null
                    company: { id: string; name: string }
                  }) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contact.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {contact.position ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <Link
                          href={`/companies/${contact.company.id}`}
                          className="text-blue-600 hover:text-blue-500"
                        >
                          {contact.company.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {contact.email ? (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 hover:text-blue-500"
                          >
                            {contact.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {contact.phone ? (
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-blue-600 hover:text-blue-500"
                          >
                            {contact.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/companies/${contact.company.id}`}
                          className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                          Voir l’entreprise
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
