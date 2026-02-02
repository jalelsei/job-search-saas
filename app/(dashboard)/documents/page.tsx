"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "CV",
    applicationId: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    fetchDocuments()
    fetchApplications()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents")
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications")
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert("Veuillez sélectionner un fichier")
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("name", formData.name)
      uploadFormData.append("type", formData.type)
      if (formData.applicationId) {
        uploadFormData.append("applicationId", formData.applicationId)
      }

      const response = await fetch("/api/documents", {
        method: "POST",
        body: uploadFormData,
      })

      if (response.ok) {
        setFormData({ name: "", type: "CV", applicationId: "" })
        setFile(null)
        await fetchDocuments()
        alert("Document uploadé avec succès")
      } else {
        const error = await response.json()
        alert(error.error || "Erreur lors de l'upload")
      }
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchDocuments()
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      alert("Une erreur est survenue")
    }
  }

  const typeMap: Record<string, string> = {
    CV: "CV",
    COVER_LETTER: "Lettre de motivation",
    OTHER: "Autre",
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Documents</h1>

      {/* Formulaire d'upload */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Uploader un document</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom du document *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type *
            </label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="CV">CV</option>
              <option value="COVER_LETTER">Lettre de motivation</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          <div>
            <label htmlFor="applicationId" className="block text-sm font-medium text-gray-700">
              Associer à une candidature (optionnel)
            </label>
            <select
              id="applicationId"
              value={formData.applicationId}
              onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Aucune</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.position} - {app.company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Fichier *
            </label>
            <input
              type="file"
              id="file"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Upload..." : "Uploader"}
          </button>
        </form>
      </div>

      {/* Liste des documents */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Aucun document pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Mes documents</h2>
          </div>
          <div className="divide-y">
            {documents.map((doc) => (
              <div key={doc.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                  <p className="text-sm text-gray-500">{typeMap[doc.type]}</p>
                  {doc.application && (
                    <p className="text-xs text-gray-400">
                      Associé à: {doc.application.position} - {doc.application.company.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 text-sm"
                  >
                    Voir
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-500 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
