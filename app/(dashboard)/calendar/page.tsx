"use client"

import { useState, useEffect } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "moment/locale/fr"

moment.locale("fr")
const localizer = momentLocalizer(moment)

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/applications")
      if (response.ok) {
        const applications = await response.json()
        const calendarEvents = applications
          .filter((app: any) => app.interviewAt || app.deadline)
          .map((app: any) => {
            if (app.interviewAt) {
              return {
                id: app.id,
                title: `Entretien: ${app.position} - ${app.company.name}`,
                start: new Date(app.interviewAt),
                end: new Date(new Date(app.interviewAt).getTime() + 60 * 60 * 1000), // 1 heure
                resource: { type: "interview", application: app },
              }
            }
            if (app.deadline) {
              return {
                id: app.id + "-deadline",
                title: `Deadline: ${app.position} - ${app.company.name}`,
                start: new Date(app.deadline),
                end: new Date(app.deadline),
                resource: { type: "deadline", application: app },
              }
            }
            return null
          })
          .filter(Boolean)

        setEvents(calendarEvents)
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEvent = (event: any) => {
    window.location.href = `/applications/${event.resource.application.id}`
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Calendrier</h1>
      <div className="bg-white shadow rounded-lg p-6" style={{ height: "600px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          style={{ height: "100%" }}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
          }}
        />
      </div>
    </div>
  )
}
