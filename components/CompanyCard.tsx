"use client"

import Link from "next/link"
import { Company } from "@prisma/client"

interface CompanyCardProps {
  company: Company & { applications?: any[]; contacts?: any[] }
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const applicationsCount = company.applications?.length || 0
  const contactsCount = company.contacts?.length || 0

  return (
    <Link
      href={`/companies/${company.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
      {company.industry && (
        <p className="text-sm text-gray-600 mt-1">{company.industry}</p>
      )}
      <div className="mt-4 flex space-x-4 text-sm text-gray-500">
        <span>{applicationsCount} candidature{applicationsCount > 1 ? "s" : ""}</span>
        <span>{contactsCount} contact{contactsCount > 1 ? "s" : ""}</span>
      </div>
    </Link>
  )
}
