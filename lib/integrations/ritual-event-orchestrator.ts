/**
 * Integration stub for Ritual Event Orchestrator
 *
 * This module provides functions to discover and link ritual templates
 * from the ritual-event-orchestrator system.
 */

export interface RitualTemplate {
  id: string
  name: string
  description: string
  category: string
  duration?: string
}

/**
 * Fetch available ritual templates from the external system
 * In production, this would make an API call to the ritual-event-orchestrator
 */
export async function fetchRitualTemplates(): Promise<RitualTemplate[]> {
  // Stub implementation - returns mock data
  // In production, replace with actual API call:
  // const response = await fetch('https://ritual-orchestrator.example.com/api/templates')
  // return response.json()

  return [
    {
      id: 'ritual-template-001',
      name: 'Monthly Community Gathering',
      description: 'Regular monthly meetup for community connection',
      category: 'community',
      duration: '2 hours',
    },
    {
      id: 'ritual-template-002',
      name: 'Quarterly Reflection Workshop',
      description: 'Deep dive into personal and collective progress',
      category: 'reflection',
      duration: '4 hours',
    },
    {
      id: 'ritual-template-003',
      name: 'Season Transition Ceremony',
      description: 'Marking seasonal changes with intention',
      category: 'ceremony',
      duration: '90 minutes',
    },
    {
      id: 'ritual-template-004',
      name: 'New Moon Circle',
      description: 'Setting intentions with lunar cycles',
      category: 'ritual',
      duration: '60 minutes',
    },
  ]
}

/**
 * Get details for a specific ritual template
 */
export async function getRitualTemplate(id: string): Promise<RitualTemplate | null> {
  const templates = await fetchRitualTemplates()
  return templates.find(t => t.id === id) || null
}

/**
 * Search ritual templates by keyword
 */
export async function searchRitualTemplates(query: string): Promise<RitualTemplate[]> {
  const templates = await fetchRitualTemplates()
  const lowerQuery = query.toLowerCase()
  return templates.filter(
    t => t.name.toLowerCase().includes(lowerQuery) ||
         t.description.toLowerCase().includes(lowerQuery) ||
         t.category.toLowerCase().includes(lowerQuery)
  )
}
