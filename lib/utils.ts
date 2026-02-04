import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Temps écoulé depuis une date (ex: "Il y a 3 jours") */
export function timeSinceLabel(date: Date | string | null | undefined): string | null {
  if (!date) return null
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return "Il y a 1 jour"
  if (days < 7) return `Il y a ${days} jours`
  const weeks = Math.floor(days / 7)
  if (weeks === 1) return "Il y a 1 semaine"
  if (weeks < 4) return `Il y a ${weeks} semaines`
  const months = Math.floor(days / 30)
  if (months === 1) return "Il y a 1 mois"
  return `Il y a ${months} mois`
}
