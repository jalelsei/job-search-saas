"use client"

import Link from "next/link"
import { Application } from "@prisma/client"
import { Company } from "@prisma/client"

interface ApplicationCardProps {
  application: Application & { company: Company }
}

const statusMap: Record<string, { label: string; color: string }> = {
  TO_APPLY: { label: "À postuler", color: "bg-yellow-100 text-yellow-800" },
  APPLIED: { label: "Candidature envoyée", color: "bg-blue-100 text-blue-800" },
  INTERVIEW: { label: "Entretien", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Refus", color: "bg-red-100 text-red-800" },
  ACCEPTED: { label: "Accepté", color: "bg-purple-100 text-purple-800" },
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const status = statusMap[application.status] || statusMap.TO_APPLY

  return (
    <Link
      href={`/applications/${application.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {application.position}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{application.company.name}</p>
          {application.deadline && (
            <p className="text-xs text-gray-500 mt-2">
              Deadline: {new Date(application.deadline).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${status.color}`}
        >
          {status.label}
        </span>
      </div>
      {application.notes && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {application.notes}
        </p>
      )}
    </Link>
  )
}
