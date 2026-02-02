"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/applications")
      if (response.ok) {
        const applications = await response.json()

        // Calculer les statistiques
        const total = applications.length
        const byStatus = applications.reduce((acc: any, app: any) => {
          acc[app.status] = (acc[app.status] || 0) + 1
          return acc
        }, {})

        const applied = applications.filter((app: any) => app.appliedAt).length
        const responded = applications.filter(
          (app: any) => app.status === "INTERVIEW" || app.status === "REJECTED" || app.status === "ACCEPTED"
        ).length
        const responseRate = applied > 0 ? (responded / applied) * 100 : 0

        const accepted = applications.filter((app: any) => app.status === "ACCEPTED").length
        const successRate = applied > 0 ? (accepted / applied) * 100 : 0

        // Temps moyen de réponse
        const respondedApps = applications.filter(
          (app: any) => app.appliedAt && (app.status === "INTERVIEW" || app.status === "REJECTED" || app.status === "ACCEPTED")
        )
        let avgResponseTime = 0
        if (respondedApps.length > 0) {
          const totalDays = respondedApps.reduce((sum: number, app: any) => {
            const appliedDate = new Date(app.appliedAt)
            const responseDate = app.interviewAt
              ? new Date(app.interviewAt)
              : new Date(app.updatedAt)
            const days = Math.floor((responseDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
            return sum + days
          }, 0)
          avgResponseTime = Math.round(totalDays / respondedApps.length)
        }

        setStats({
          total,
          byStatus,
          responseRate: Math.round(responseRate * 10) / 10,
          successRate: Math.round(successRate * 10) / 10,
          avgResponseTime,
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  if (!stats) {
    return <div className="p-6">Aucune donnée disponible</div>
  }

  const statusData = [
    { name: "À postuler", value: stats.byStatus.TO_APPLY || 0 },
    { name: "Candidature envoyée", value: stats.byStatus.APPLIED || 0 },
    { name: "Entretien", value: stats.byStatus.INTERVIEW || 0 },
    { name: "Refus", value: stats.byStatus.REJECTED || 0 },
    { name: "Accepté", value: stats.byStatus.ACCEPTED || 0 },
  ]

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"]

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics</h1>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm font-medium text-gray-500">Candidatures totales</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-2xl font-bold text-blue-600">{stats.responseRate}%</div>
          <div className="text-sm font-medium text-gray-500">Taux de réponse</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
          <div className="text-sm font-medium text-gray-500">Taux de succès</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}j</div>
          <div className="text-sm font-medium text-gray-500">Temps moyen de réponse</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Répartition par statut
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Distribution des statuts
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
